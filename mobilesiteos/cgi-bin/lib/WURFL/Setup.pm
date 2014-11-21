package WURFL::Setup;

$VERSION = '1.08';	# Derived from Mobile::Wurfl version 1.08

#------------------------------------------------------------------------------
# For the original work see: <http://wurfl.sourceforge.net/perl/mobile_wurfl.php>
# Ave Wrigley <Ave.Wrigley@itn.co.uk>
#
# Copyright (c) 2004 Ave Wrigley. All rights reserved. This program is free
# software; you can redistribute it and/or modify it under the same terms as Perl
# itself.
#------------------------------------------------------------------------------

use strict;
use warnings;
use XML::Parser( Style => "Object" );
require LWP::UserAgent;
use HTTP::Date;
use Time::localtime;
use HTML::Template;
use File::Spec;
use File::Basename;
use IO::Uncompress::Unzip qw(unzip $UnzipError);;
use IO::Uncompress::Gunzip qw(gunzip $GunzipError);
use WURFL::Access;


sub new_wurfl {
    my $config = shift;

    # Include our configuration variables...
    my %opts = %$config;

    # Add our previously (Mobile::Wurfl) common access sub's
    $opts{'access'} = &WURFL::Access::new_wurfl($config);
    
    my $self = bless \%opts;

    if ( ! $self->{verbose} ) {
        open( STDERR, ">" . File::Spec->devnull() )
    } elsif ( $self->{verbose} == 1 ) {
        open( STDERR, ">$self->{wurfl_path}wurfl.log" );
    } else {
        warn "&" . (caller(0))[3] . " -> log to STDERR\n";
      }

    if (!$self->{wurfl_url}) {
	$self->{wurfl_status} .= "Missing WURFL Download file url spec in WURLF::Config!\n";
    } else {
	#get a filename from the URL and remove .zip or .gzip suffix
	my $name = (fileparse($self->{wurfl_url}, '.zip', '.gzip'))[0];
	$self->{wurfl_file} = $self->{wurfl_path} . $name . '.xml';
	$self->{ua} = LWP::UserAgent->new;
      }

    if (! -e $self->{wurfl_file}) {
	$self->{wurfl_action} = 'download';
    }

    return $self;
}

sub create_tables {
    my $self = shift;
    my $sql = shift;

    my $tables  = $self->{'wurfl_tables'};
    my $device  = $self->{device_table_name};
    my $capable = $self->{capability_table_name};

    if (!$sql) {
	my $template = join( '', <DATA> );
        my $tt = HTML::Template->new(scalarref => \$template);

	# Set up some template variables
	$tt->param(device_table_name	 => $device);
	$tt->param(capability_table_name => $capable);

    $tt->param(dev_ua	=> $tables->{$device}->[0]);
	$tt->param(dev_fb	=> $tables->{$device}->[1]);
	$tt->param(cap_ua	=> $tables->{$capable}->[0]);
	$tt->param(cap_group	=> $tables->{$capable}->[1]);
	$tt->param(cap_name	=> $tables->{$capable}->[2]);
	$tt->param(cap_value	=> $tables->{$capable}->[3]);

	$tt->param(user_agent_vc_length => $self->{user_agent_vc_length});
	$tt->param(group_vc_length	=> $self->{group_vc_length});
	$tt->param(name_vc_length	=> $self->{name_vc_length});
	$tt->param(value_vc_length	=> $self->{value_vc_length});

	$sql = $tt->output();
	#print $sql;
	print STDERR "&" . (caller(0))[3] . " -> create database tables from <DATA> template.\n";
    }
    $self->{create_table_sql} = $sql;
    for my $statement ( split( /\s*;\s*/, $sql ) ) {
	next unless $statement =~ /\S/;
	$self->{access}->{dbh}->do( $statement ) or die "$statement failed\n";
    }
    print STDERR "&" . (caller(0))[3] . " -> created database tables.\n";
}

sub touch( $$ ) { 
    my $path = shift;
    my $time = shift;

    die "&" . (caller(0))[3] . " -> no path" unless $path;
    die "&" . (caller(0))[3] . " -> no time" unless $time;
    print STDERR  "&" . (caller(0))[3] . " -> touch $path ($time)\n";
    return utime( $time, $time, $path );
}

sub build_tables {
    my $self = shift;
    my $atts_ref = shift;
    my $caps_ref = shift;

    my $wurfl_tables = $self->{'wurfl_tables'};
    my %tables = %$wurfl_tables;

    print STDERR "&" . (caller(0))[3] . " -> flush dB tables.\n";
    $self->{access}->{dbh}->begin_work;
    $self->{access}->{dbh}->do( "DELETE FROM $self->{device_table_name}" );
    $self->{access}->{dbh}->do( "DELETE FROM $self->{capability_table_name}" );

    # Build some input sql statements
    for my $table ( keys %tables ) {
	next if $self->{$table}{sth};
        my @fields = @{$tables{$table}};
	
        my $fields = join( ",", @fields );
        my $placeholders = join( ",", map "?", @fields );
        my $sql = "INSERT INTO $table ( $fields ) VALUES ( $placeholders ) ";
        $self->{$table}{sth} = $self->{access}->{dbh}->prepare( $sql );
    }

    # Build the 'device' table using above statements
    foreach my $ua (keys %$atts_ref) {
	my @values = ($ua, $atts_ref->{$ua});
	$self->{device}{sth}->execute( @values );
    }

    # Build the 'capability' table using above statements
    foreach my $ua (keys %$caps_ref) {
	my $group_ref = $caps_ref->{$ua};
	foreach my $group (keys %$group_ref) {
	    my $capbability_ref = $group_ref->{$group};
	    foreach my $cap_key (keys %$capbability_ref) {
		my @values = ($ua, $group, $cap_key, $capbability_ref->{$cap_key});
		$self->{capability}{sth}->execute( @values );
	    }
	}
    }

    print STDERR "&" . (caller(0))[3] . " -> commit database.\n";
    $self->{access}->{dbh}->commit;
    return 1;
}

sub get_local_stats {
    my $self = shift;

    if (-e $self->{wurfl_file}) {
	my @stat = ( stat $self->{wurfl_file} )[ 7,9 ];
	my $datetime = ctime( $stat[1] );

	$self->{wurfl_status} .= "Local WURFL file: " . $self->{wurfl_file} . "\n";
	$self->{wurfl_status} .= "File date/time: " . $datetime . ", ref. (" . $stat[0] . ', ' . $stat[1] . ")\n";

	$self->{wurfl_local} = \@stat;
    } else {
	$self->{wurfl_status} .= "Local WURFL file: " . $self->{wurfl_file} . $self->{wurfl_action}. " does not exist!\n" if $self->{wurfl_action} eq 'continue';
      }
    print STDERR "&" . (caller(0))[3] . " -> stat for " . $self->{wurfl_file} . " = (" . $self->{wurfl_local}[0] . ', ' . $self->{wurfl_local}[1] . ")\n";
}

sub get_remote_stats {
    my $self = shift;

    my $response = $self->{ua}->head( $self->{wurfl_url} );
    my $temp_text = "&" . (caller(0))[3] . " -> ";

    unless ($response->is_success) {
	$self->{wurfl_status} .= $temp_text . $response->status_line . "\n";
	return;
    }
    unless ($response->content_length) {
	$self->{wurfl_status} .= $temp_text . "can't get content_length stat for:\n" . $self->{wurfl_url};
	return;
    }
    unless ($response->last_modified) {
	$self->{wurfl_status} .= $temp_text . "can't get last_modified stat for:\n" . $self->{wurfl_url};
	return;
    }

    my @stat = ( $response->content_length, $response->last_modified );
    my $datetime = ctime( $response->last_modified );

    $self->{wurfl_status} .= "Remote WURFL file: " . $self->{wurfl_url} . "\n";
    $self->{wurfl_status} .= "File date/time: " . $datetime . ", ref. (" . $stat[0] . ', ' . $stat[1] . ")\n";

    $self->{wurfl_remote} = \@stat;
    print STDERR "&" . (caller(0))[3] . " -> stat for " . $self->{wurfl_url} . " = (" . $stat[0] . ', ' . $stat[1] . ")\n";
    return 1;
}

sub check_remote {
    my $self = shift;
    $self->get_local_stats();
    $self->{wurfl_status} .= "\n";
    if ($self->get_remote_stats()) {
	if ($self->{wurfl_local}[1] == $self->{wurfl_remote}[1]) {
	    print STDERR "&" . (caller(0))[3] . " -> local and remote files have the same spec's\n";
	    $self->{wurfl_status} .= "\nRemote and local WURFL files have same last modified date!\n";
	    $self->{wurfl_status} .= "Continue on by clicking 'Step' links.\n";
	    $self->{wurfl_action} = 'db_ready';
	} else {
	    $self->{wurfl_status} .= "\nA newer version of WURFL data is available. Click 'Download' to get latest version!\n" if $self->{wurfl_action} eq 'continue';
	    $self->{wurfl_action} = 'download';
	  }
    } else {
	$self->{wurfl_status} .= "\n\nThere was a problem connecting to the remote WURFL XML data file.\nPlease check your internect connection and/or verify the WURLF data file url.\n\n";
	$self->{wurfl_action} = 'continue';
      }
}

sub get_wurfl {
    my $self = shift;
    my $temp_text = "&" . (caller(0))[3] . ' -> ';

    # Check to see if files are the same vintage
    $self->check_remote();

    if ($self->{wurfl_local}[1] == $self->{wurfl_remote}[1]) {
	$self->{wurfl_action} = 'continue';	# Cancel 'rebuild' action
	return;
    }

    #create a temp filename
    my $tempfile = "$self->{wurfl_path}wurfl_$$";

    open(TMP, "> $tempfile") || die $temp_text . "Could not create file: " . $tempfile;
    print TMP 'done';
    close(TMP);

    my $response = $self->{ua}->get( 
        $self->{wurfl_url},
        ':content_file' => $tempfile
    );
    die $temp_text . $response->status_line unless $response->is_success;

    print STDERR $temp_text . 'retrieved from url:' . $self->{wurfl_url} . "\nfile: " . $self->{wurfl_file} . "\n";

    if ($response->{_headers}->header('content-type') eq 'application/x-gzip') {
        gunzip($tempfile => $self->{wurfl_file}) || die $temp_text . "gunzip failed: $GunzipError\n";
        unlink($tempfile);
    } elsif ($response->{_headers}->header('content-type') eq 'application/zip') {
        unzip($tempfile => $self->{wurfl_file})  || die $temp_text . "unzip failed: $UnzipError\n";
        unlink($tempfile);
    } else {
        move($tempfile, $self->{wurfl_file});
    }

    # Set WURFL file 'last modified' time to same as remote
    touch( $self->{wurfl_file}, $self->{wurfl_remote}[1] );

    # Reset $self->{wurfl_local} value...
    $self->get_local_stats();

    if ($self->{wurfl_local}[1] == $self->{wurfl_remote}[1]) {
	$self->{wurfl_status} .= "\nSuccessfully downloaded WURFL data from url: " . $self->{wurfl_url} . "\n";
	$self->{wurfl_action} = 'db_ready';
    } else {
	$self->{wurfl_status} .= "\nFailed to downloaded WURFL data from url: " . $self->{wurfl_url} . "\n";
	$self->{wurfl_action} = 'download';
      }
}

sub cleanup {
    my $self = shift;
    my $wurfl_tables = $self->{'wurfl_tables'};

    print STDERR "&" . (caller(0))[3] . " -> cleanup our database.\n";
    if ( $self->{access}->{dbh} ) {
        print STDERR "&" . (caller(0))[3] . " -> drop database tables\n";
        for ( keys %$wurfl_tables ) {
            print STDERR "&" . (caller(0))[3] . " -> DROP TABLE IF EXISTS $_\n";
            $self->{access}->{dbh}->do( "DROP TABLE IF EXISTS $_" );
        }
    }
    return unless	$self->{wurfl_file};
    return unless -e	$self->{wurfl_file};
    print STDERR "&" . (caller(0))[3] . " -> unlink $self->{wurfl_file}\n";
    unlink $self->{wurfl_file} || die "&" . (caller(0))[3] . " -> can't remove $self->{wurfl_file}: $!\n";
}



1;

__DATA__

DROP TABLE IF EXISTS <TMPL_VAR NAME=device_table_name>;
CREATE TABLE <TMPL_VAR NAME=device_table_name>
(
  <TMPL_VAR NAME=dev_ua>	VARCHAR(<TMPL_VAR NAME=user_agent_vc_length>)	NOT NULL	DEFAULT '',
  <TMPL_VAR NAME=dev_fb>	VARCHAR(<TMPL_VAR NAME=user_agent_vc_length>)	NOT NULL	DEFAULT '',

  PRIMARY KEY (user_agent)
);

DROP TABLE IF EXISTS <TMPL_VAR NAME=capability_table_name>;
CREATE TABLE <TMPL_VAR NAME=capability_table_name>
(
  id			INT					NOT NULL	AUTO_INCREMENT,
  <TMPL_VAR NAME=cap_ua>	VARCHAR(<TMPL_VAR NAME=user_agent_vc_length>)	NOT NULL	DEFAULT '',
  <TMPL_VAR NAME=cap_group>	VARCHAR(<TMPL_VAR NAME=group_vc_length>)	NOT NULL	DEFAULT '',
  <TMPL_VAR NAME=cap_name>	VARCHAR(<TMPL_VAR NAME=name_vc_length>)		NOT NULL	DEFAULT '',
  <TMPL_VAR NAME=cap_value>	VARCHAR(<TMPL_VAR NAME=value_vc_length>)	NOT NULL	DEFAULT '',

  PRIMARY KEY (id)
);
