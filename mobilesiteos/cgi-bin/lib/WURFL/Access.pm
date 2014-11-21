package WURFL::Access;

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
use DBI;
use DBD::mysql;

sub new_wurfl {
    my $config = shift;

    # Include our configuration variables...
    my %opts = %$config;

    my $self = bless \%opts;

    if ( $self->{verbose} == 1 ) {
        open( STDERR, ">$self->{wurfl_path}wurfl.log" );
    }

    return $self;
}

sub tables_exist {
    my $self = shift;
    my $wurfl_tables = $self->{'wurfl_tables'};

    my %db_tables = map { my $key = $_ =~ /(.*)\.(.*)/ ? $2 : $_ ; $key => 1 } $self->{dbh}->tables();
    for my $table ( keys %$wurfl_tables ) {
        unless ($db_tables{$self->{dbh}->quote_identifier($table)}) {
	    print STDERR "&" . (caller(0))[3] . " -> database is missing table: " . $table . "\n";
	    return 0;
	}
    }
    return 1;
}

sub _init {
    my $self = shift;

    return if $self->{initialised};

    my $device  = $self->{device_table_name};
    my $capable = $self->{capability_table_name};

    my $tables = $self->{'wurfl_tables'};

    my $dev_ua = $tables->{$device}->[0];
    my $dev_fb = $tables->{$device}->[1];
    
    my $cap_ua	  = $tables->{$capable}->[0];
    my $cap_group = $tables->{$capable}->[1];
    my $cap_name  = $tables->{$capable}->[2];
    my $cap_value = $tables->{$capable}->[3];

    if ( ! $self->connect_db() ) {
	die "&" . (caller(0))[3] . " -> could not connect to db: " . $self->{db_descriptor} . " as " . $self->{db_username} . "\n";
    }

    if ( ! $self->tables_exist() ) {
        die "&" . (caller(0))[3] . " -> tables don't exist on db: " . $self->{db_descriptor} . "\n";
    }

    # Get all encoded user_agent strings which match a particular first three character pattern
    $self->{user_agents_sth} = $self->{dbh}->prepare( 
        "SELECT $dev_ua FROM $device WHERE $dev_ua LIKE ?"
    );
    # Get the specific encoded fall_back string for a given encoded user_agent
    $self->{fall_back_sth} = $self->{dbh}->prepare(
        "SELECT $dev_fb FROM $device WHERE $dev_ua = ?"
    );
    # Get all capability records for a specific encoded user_agent string
    $self->{capability_lookup_sth} = $self->{dbh}->prepare(
        "SELECT $cap_group, $cap_name, $cap_value FROM $capable WHERE $cap_ua = ?"
    );

    $self->{initialised} = 1;
}

sub get_user_agents {
    my $self = shift;
    my $ua_substring = shift;
    $self->_init();

    # We want to get all that match by the first three characters
    $ua_substring = substr($ua_substring, 0, 3);
    $ua_substring .= '%';
    $self->{user_agents_sth}->execute($ua_substring);
    return map $_->[0], @{$self->{user_agents_sth}->fetchall_arrayref()};
}

sub get_fall_back {
    my $self = shift;
    my $u_agent = shift;
    my $fall_back = undef;
    $self->_init();

    if ($u_agent) {
	$self->{fall_back_sth}->execute( $u_agent );
	$fall_back = $self->{fall_back_sth}->fetchrow || undef;
    }
    return $fall_back;
}

sub get_ua_capabilities {
    my $self = shift;
    my $u_agent = shift;
    my %hash = ();
    $self->_init();

    my $capable = $self->{capability_table_name};
    my $tables = $self->{'wurfl_tables'};

    my $cap_group = $tables->{$capable}->[1];
    my $cap_name  = $tables->{$capable}->[2];
    my $cap_value = $tables->{$capable}->[3];

    $self->{capability_lookup_sth}->execute( $u_agent );

    while (my $cap_ref = $self->{capability_lookup_sth}->fetchrow_hashref) {
	my $group = $cap_ref->{$cap_group};
	my $name  = $cap_ref->{$cap_name};
	my $value = $cap_ref->{$cap_value};

	# Build group hash ref if new
	unless ($hash{$group}) { $hash{$group} = {}; }

	# Now load group hash
	$hash{$group}->{$name} = $value;
    }

    return \%hash;
}

sub connect_db {
    my $self = shift;
    my $flag_db = 'yes';

    print STDERR "&" . (caller(0))[3] . " -> connecting to " . $self->{db_descriptor} . " as " . $self->{db_username} . "\n";
    $self->{dbh} ||= DBI->connect( 
        $self->{db_descriptor},
        $self->{db_username},
        $self->{db_password},
        { RaiseError => 1 }
    ) or $flag_db = 'no';

    if ($flag_db eq 'yes') {
	return 1;
    } else {
	warn "&" . (caller(0))[3] . " -> Could not connect to $self->{db_descriptor}: " . $DBI::errstr;
	return;
      }
}


1;