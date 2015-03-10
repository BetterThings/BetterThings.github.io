#!/usr/bin/perl
use utf8;
use warnings;
use diagnostics;
#
# Copyright Notice:
my $script_name = 'Site-Troubleshooter';
my $script_vers = '14.4.16';
my $script_date = 'Apr. 16, 2014';
my $script_year = '2014';

#  Copyright© - OpenSiteMobile
my $copyright_year = '2008-2014';
#  All rights reserved
#
# Description:
#
# Site-Troubleshooter is a simple perl script that provides information about what
# modules are installed on your server, server paths, perl configuration settings,
# browser information and the CGI environment. It is designed to work (hopefully)
# with mobile devices to aid in troubleshooting and testing of the mobile web.
#
# Contact Information:
#
# Author: Dwight Vietzke Jr.
# Email:  dwight_vietzke@yahoo.com
#


# ==========================================================================
#     Beginning of script...
# ==========================================================================

#  Turn off output buffering...
# -----------------------------

$| = 1;


# Required Modules
# -----------------------------

use CGI::Carp qw(fatalsToBrowser set_message);
use CGI qw(:cgi);
use Config;
use Cwd;
use Fcntl ":flock";
use File::Find;
use IO::File;
use lib ('./lib');
use MSOS::Base;
use strict;

$CGI::POST_MAX=1024 * 25;	# max 25K posts
$CGI::DISABLE_UPLOADS = 1;	# no uploads
$CGI::HEADERS_ONCE = 1;		# one set of HTTP headers please

BEGIN { set_message(\&MSOS::Base::handle_errors); }

my %def = ();
my $q = new CGI;

%def = (

    'javascript'    => '',

    'script_url'    => $q->url,

	'test_txt' => {

		'message3'	=>  'CGI Environment Variables',
		'message4'	=>  'not defined',
		'message5'	=>  'na',

		'check_flock'	=>  'Check flock - Unable to OPEN new_tmpfile (\&check_flock):',
		'check_shared1'	=>  'Please note: Most OpenSiteMobile scripts will require file create permissions to work correctly.',
		'check_shared2'	=>  'You may have to set folder permissions manually.',
		'check_shared3'	=>  'Ckeck Shared - Unable to create new_tmpfile to test flock sharing functions:',
		'check_shared4'	=>  'Ckeck Shared - Unable to duplicate filehandle to test flock sharing functions:',
		'check_shared5'	=>  'Ckeck Shared - Unable to delete \&FH1 test file:',
		'checktitle0'	=>  'Troubleshooting Options',
		'checkbox1'	    =>  'Perl Env.',
		'checktitle1'	=>  'Display Perl environment variables',
		'checkbox2'	    =>  'Perl Modules',
		'checktitle2'	=>  'Display available Perl modules',
		'checkbox3'	    =>  'Site Spec&#39;s',
		'checktitle3'	=>  'Web site specific parameters',
		'checkbox4'	    =>  'Server Env.',
		'checktitle4'	=>  'Server environment parameters',
		'checkbox5'	    =>  'Config Module',
		'checktitle5'	=>  'Display Config.pm parameters',
		'checkbox6'	    =>  'Browser Env.',
		'checktitle6'	=>  'Review your browser environment',
		'checkbox7'	    =>  'View Info',
		'perl_vars1'	=>  'Perl Environment on the Server',
		'perl_vars2'	=>  'Perl Version',
		'perl_vars3'	=>  'Perl Exe',
		'perl_vars4'	=>  'Perl Compile OS',
		'perl_vars5'	=>  'CGI.pm Version',
		'perl_vars6'	=>  'Carp.pm Version',
		'perl_vars7'	=>  'Perl Library Path',
		'perl_mod1'	    =>  'Server&#39;s Perl Module Info',
        'perl_mod4'     =>  'Version',
		'perl_mod5'	    =>  'na',
		'site_info1'	=>  'Site Specific Info',
		'site_info2'	=>  'Server Type',
		'site_info3'	=>  'User Name',
		'site_info4'	=>  'Path',
		'site_info5'	=>  'Root url',
		'site_info6'	=>  'OS Type Config.pm',
		'site_info7'	=>  'OS Type $^O',
		'site_info8'	=>  'CGI.pm self_url Value',
		'site_info9'	=>  'CGI.pm url Value',
		'site_infoa'	=>  'Sendmail Location',
		'site_infob'	=>  'flock Supported',
		'site_infoc'	=>  'flock File Sharing',
		'site_infod'	=>  'Date/Time on Server',
		'site_infoe'	=>  'Path(s) to Perl',
		'site_infof'	=>  'Path(s) to Sendmail',
		'site_infog'	=>  'Path(s) to Ping',
		'site_infoh'	=>  'Path(s) to Whois',
		'site_infoi'	=>  'Path(s) to Traceroute',
		'site_infoj'	=>  'Path(s) to Finger',
		'site_infok'	=>  'Path(s) to Host',
		'site_infol'	=>  'Path(s) to NSLookup',
		'site_infom'	=>  'Path(s) to DNSQuery',
		'site_infon'	=>  'Uptime',
		'site_infoo'	=>  'na',
		'config_pm1'	=>  'Server&#39;s Config.pm Info',
		'browser_env1'	=>  'Browser Env.',
		'browser_env2'	=>  'Code Name',
		'browser_env3'	=>  'Name',
		'browser_env4'	=>  'Version',
		'browser_env5'	=>  'User Agent',
		'browser_env6'	=>  'Language',
		'browser_env7'	=>  'Platform',
		'browser_env8'	=>  'CPU Class',
		'browser_env9'	=>  'Browser Language',
		'browser_enva'	=>  'Cookies Enabled',
		'browser_envb'	=>  'User Language',
		'browser_envc'	=>  'System Language',
		'browser_envd'	=>  'Online',
		'browser_enve'	=>  'Saved Links',
		'browser_envf'	=>  'Screen Width',
		'browser_envg'	=>  'Screen Height',
		'browser_envh'	=>  'Java',
		'browser_envi'	=>  'Java is',
		'browser_envj'	=>  'Not',
		'browser_envk'	=>  'Enabled'
	}
);

# -- Add all our external config variables
foreach ( keys %$MSOS::Base::defined ) { $def{$_} = $MSOS::Base::defined->{$_}; }

# -- Add this script's details (default is MSOS::Base)
$def{'script_info'} = {
	'name'			=> $script_name,
	'revision_date'	=> $script_date,
	'version'		=> $script_vers,
	'year'			=> $copyright_year,
};

# -- Set Debug on/off
$def{'debug'} = $q->param('debug') || '';


# Set some 'run' specific variables
# -----------------------------
$def{'script_dir'}	    = cwd;
$def{'sendmail_loc'}    = &MSOS::Base::check_sendmail();
$def{'time'}		    = scalar(localtime());              
$def{'use_flock'}	    = &check_flock($q, \%def);
$def{'use_shared'}	    = &check_shared($q, \%def);


# Perl Version Test
# -----------------------------
require 5.008;


# Test CGI.pm module for input errors
# -----------------------------
if ($CGI::VERSION >= 2.56) { if ($q->cgi_error) { &MSOS::Base::handle_errors($q->cgi_error, 'yes'); } }


# 'use' selected module as picked by user in 'Get Version' 
# -----------------------------
if ($q->param('module')) {

	my $module_version = 'use ' . $q->param('module') . ';';
	eval $module_version;
}


# Calculate Site-Troubleshooter Info
# -----------------------------
foreach ($q->param('ss_display')) {

	if ($_ eq 'perl_env')		{     &perl_env_info($q, \%def); }
	if ($_ eq 'site_info')		{         &site_info($q, \%def); }
	if ($_ eq 'server_env')		{   &server_env_info($q, \%def); }
	if ($_ eq 'perl_modules')	{ &perl_modules_info($q, \%def); }
	if ($_ eq 'config_pm')		{    &config_pm_info($q, \%def); }
    if ($_ eq 'browser_env')	{  &browser_env_info($q, \%def); }
}

# -- Debugging and tests
if ($def{'debug'}) {
	&MSOS::Base::run_debugging( $q, \%def );
}


# Std. Script Output starts here!
#================================================

binmode(STDOUT, ":utf8");

print $q->header(

	-type		=> $def{'content_type'},
	-etag		=> int(rand 9999)+1,
	-expires	=> 'now',
	-last_modified	=> scalar(gmtime)
);


# Display Options
# -----------------------------
&checkbox($q, \%def);


# Printout results for calculated sections
# -----------------------------
print "\t<section>\n" . $def{'results_list'} . "\n\t</section>\n";

# Add javascript if present
# -----------------------------
if ($def{'javascript'}) { print $def{'javascript'}; }

# Add debugging if requested
# -----------------------------
if ($def{'debug'}) { print $def{'debug_list'}; }



#  End Body of Script
#================================================



#  SUBROUTINES
#================================================

sub check_flock {
# -----------------------------

    my $r = shift;
    my $dref = shift;

    my $support_flock = 'yes';

    if ($dref->{'debug'}) { $dref->{'debug_list'} .= "\n<p> -- sub - check_flock</p>\n"; }

    *FH1 = new_tmpfile IO::File or &MSOS::Base::handle_errors( "$dref->{'test_txt'}->{'check_flock'}<br /><br />$!", 'yes' );

    eval {
        flock (&FH1, LOCK_SH);
        flock (&FH1, LOCK_UN);
    };

    if ($@) { $support_flock = 'no'; }

    if ($dref->{'debug'}) { $dref->{'debug_list'} .= "\n<p> -- sub - check_flock - end ***<br />$@</p>\n"; }

    return $support_flock;
}

sub check_shared {
# -----------------------------

    my $r = shift;
    my $dref = shift;

    my $support_shared = 'yes';

    if ($dref->{'debug'}) {$dref->{'debug_list'} .= "\n<p> -- sub - check_shared</p>\n";}

    *FH1 = new_tmpfile IO::File or &temp_failed($dref, $!);

    sub temp_failed {

        my $dref2 = shift;
        my $error_list = shift || 'unknown error';

        $error_list  = "$dref2->{'test_txt'}->{'check_shared3'}<br /><br />$error_list<br /><br />\n";
        $error_list .= "$dref2->{'test_txt'}->{'check_shared1'}<br /><br />\n";
        $error_list .= "$dref2->{'test_txt'}->{'check_shared2'}\n";
        &MSOS::Base::handle_errors( $error_list, 'yes' );
    }
    
    eval { flock (&FH1, LOCK_SH); };
    if ($@) { $support_shared = 'no'; $@ = ''; }

    open FH2, ">> &FH1" or &MSOS::Base::handle_errors( "$dref->{'test_txt'}->{'check_shared4'}<br /><br />$!", 'yes' );
    print FH2 'This is a test file entry';

    eval {
        if (flock (&FH2, LOCK_SH | LOCK_NB))	{ $support_shared = 'shared';		}
        else      				                { $support_shared = 'exclusive';	}
    };

    if ($@) { $support_shared = 'no'; $@ = ''; }
    close FH2;
    
    # -- Clean up the subroutine's test file

    if (-e '&FH1') {
        unlink '&FH1' or &MSOS::Base::handle_errors( "$dref->{'test_txt'}->{'check_shared5'}<br /><br />$!", 'yes' );
    }

    if ($dref->{'debug'}) { $dref->{'debug_list'} .= "\n<p> -- sub - check_shared - end ***</p>\n"; }
    
    return $support_shared;
}

sub env_hash {
# -----------------------------

    my $r = shift;
    my $dref = shift;

    my $key = '';
    my $output = '';

    $output .= "<table class='table table-bordered table-striped table-wordbreak'>";
    $output .= "<tr><th colspan='3'>$ENV{'SERVER_NAME'} $dref->{'test_txt'}->{'message3'}</th></tr>\n";

    foreach $key ( sort keys %ENV ) {

        my $value = '';

        $value = $ENV{$key} || $dref->{'test_txt'}->{'message4'};
        $value =~ s/;/; /g;
        $value =~ s/&/ &/g;
        $key =~ s/_/ /g;

        $value = CGI::escapeHTML($value);

        $output .= "<tr><td>$key</td><td colspan='2'>$value</td></tr>\n";
    }

    $output .= "</table>";
    return $output;
}

sub perl_vars {
# -----------------------------

    my $r = shift;
    my $dref = shift;

    my $output = '';
    my $value = '';

    $output .= "<table class='table table-bordered table-striped table-wordbreak'>";
    $output .= "<tr><th colspan='2'>$dref->{'test_txt'}->{'perl_vars1'} $ENV{'SERVER_NAME'}</th></tr>\n";
    $output .= "<tr><td>$dref->{'test_txt'}->{'perl_vars2'}</td><td>$]</td></tr>\n";
    $output .= "<tr><td>$dref->{'test_txt'}->{'perl_vars3'}</td><td>$^X</td></tr>\n";
    $output .= "<tr><td>$dref->{'test_txt'}->{'perl_vars4'}</td><td>$^O</td></tr>\n";
    $output .= "<tr><td>$dref->{'test_txt'}->{'perl_vars5'}</td><td>$CGI::VERSION</td></tr>\n";
    $output .= "<tr><td>$dref->{'test_txt'}->{'perl_vars6'}</td><td>$CGI::Carp::VERSION</td></tr>\n";

    foreach $value (@INC) {
        $output .= "<tr><td>$dref->{'test_txt'}->{'perl_vars7'}</td><td>$value</td></tr>\n";
    }

    $output .= "</table>";
    return $output;
}

sub checkbox {
# -----------------------------

    my $r = shift;
    my $dref = shift;

    my $output = '';

    $output .= "<h2>$dref->{'script_info'}->{'name'} v$dref->{'script_info'}->{'version'}</h2>\n";
    $output .= "<form method='get' action=\"$dref->{'script_url'}\">\n";

    $output .=  "<table class='table table-bordered'>" .
                "<tr><th colspan='3'>$dref->{'test_txt'}->{'checktitle0'}</th></tr><tr>\n" .
                "<td title='$dref->{'test_txt'}->{'checktitle1'}'><input type='checkbox' name='ss_display' value='perl_env' />	    <br />$dref->{'test_txt'}->{'checkbox1'} </td>\n" .
                "<td title='$dref->{'test_txt'}->{'checktitle2'}'><input type='checkbox' name='ss_display' value='perl_modules' /> 	<br />$dref->{'test_txt'}->{'checkbox2'} </td>\n" .
                "<td title='$dref->{'test_txt'}->{'checktitle3'}'><input type='checkbox' name='ss_display' value='site_info' />	    <br />$dref->{'test_txt'}->{'checkbox3'} </td></tr><tr>\n" .
                "<td title='$dref->{'test_txt'}->{'checktitle4'}'><input type='checkbox' name='ss_display' value='server_env' />    <br />$dref->{'test_txt'}->{'checkbox4'} </td>\n" .
                "<td title='$dref->{'test_txt'}->{'checktitle5'}'><input type='checkbox' name='ss_display' value='config_pm' />	    <br />$dref->{'test_txt'}->{'checkbox5'} </td>\n" .
                "<td title='$dref->{'test_txt'}->{'checktitle6'}'><input type='checkbox' name='ss_display' value='browser_env' />   <br />$dref->{'test_txt'}->{'checkbox6'} </td></tr>\n" .
                "</table>";

    $output .=  "<div style='margin-top:6px;'><input type='submit' class='btn btn-success' name='send_checkbox' value='$dref->{'test_txt'}->{'checkbox7'}' />\n" .
                "</div></form>\n";

	if ($r->param('ss_display')) { $output .= "\n<hr /><br />\n"; }

    $dref->{'results_list'} = $output . $dref->{'results_list'};
}

sub perl_env_info {
# -----------------------------

    my $r = shift;
    my $dref = shift;

    $dref->{'results_list'} .= &perl_vars($r, $dref);
}

sub perl_modules_info {
# -----------------------------

    my $r = shift;
    my $dref = shift;

    my $module_name = $r->param('module') || '';    # Get version
    my $dir = '';
    my $wanted = '';
    my $output = '';

    my @mod_dir = ();
    my @modules = ();
    my %installed_modules = ();

    if ($dref->{'debug'}) { $dref->{'debug_list'} .= "\n<p> -- sub - perl_modules_info</p>\n"; }

    $wanted = sub {

        if ($File::Find::name =~ /\.pm$/) {

            open(MODULE,$File::Find::name) || return;
            while(<MODULE>){ if (/^ *package +(\S+);/){ push (@modules, $1); last; } }
            close MODULE;
        }
    };

    $output .= "<table class='table table-bordered table-striped table-wordbreak'>\n";
    $output .= "<tr><th colspan='4'>$ENV{'SERVER_NAME'} $dref->{'test_txt'}->{'perl_mod1'} \n<br /><span class='no_br'>v$] CGI.pm v$CGI::VERSION</span></th></tr>\n";

    foreach (@INC) { if ($_ ne '.') { push (@mod_dir, $_); } }

    if ($dref->{'debug'}) { $dref->{'debug_list'} .= "\n<p>....\@mod_dir = @mod_dir</p>\n"; }

    foreach $dir (@mod_dir) {

        find( { wanted => $wanted, untaint => 1, untaint_pattern => qr|^([-+@\w./:]+)$| }, $dir);
        if ($dref->{'debug'}) { $dref->{'debug_list'} .= "\n<p>....\$dir = $dir<br />....\@modules = @modules</p>\n"; }
        foreach (sort @modules) {$installed_modules{$_} = $dir;}
        @modules = ();
    }

    foreach (sort keys %installed_modules) {

        my $version = '';
        my $temp_mod = $_;

        if ($module_name && ($temp_mod eq $module_name)) {

            $version = '$' . $temp_mod . '::VERSION';
            $version = eval $version;

            if ($@ || !$version) {
                $version = $dref->{'test_txt'}->{'perl_mod5'};
                if ($dref->{'debug'}) { $dref->{'debug_list'} .= "\n<p>....$module_name version failed:<br />$@</p>\n"; }
                $@ = '';
            }
        } else {
            $version  = "<a class='btn btn-msos' href='$dref->{'cgi_url'}&amp;ss_display=perl_modules&amp;module=$_'>$dref->{'test_txt'}->{'perl_mod4'}</a>\n";
          }

        $output .= "<tr><td colspan='3'>$temp_mod</td><td title='$installed_modules{$_}'>$version</td></tr>\n";
    }

    $output .= "</table>";

    # Load into our results variable
    $dref->{'results_list'} .= $output;

    if ($dref->{'debug'}) { $dref->{'debug_list'} .= "\n<p> -- sub - perl_modules_info - end ***</p>\n"; }
}

sub site_info {
# -----------------------------

    my $r = shift;
    my $dref = shift;

    my $cgi_self_url = '';
    my $root_url = '';
    my $script_dir = '';
    my $script_url = '';

    if ($dref->{'debug'}) { $dref->{'debug_list'} .= "\n<p> -- sub - site_info</p>\n"; }

    $cgi_self_url = $r->self_url;
    $cgi_self_url =~ s/;/; /g;
    $cgi_self_url =~ s/&/ &/g;

    $root_url	    = $dref->{'home_url'};
    $script_url	    = $dref->{'script_url'};
    $script_dir	    = $dref->{'script_dir'};

    $dref->{'results_list'} .= "<table class='table table-bordered table-striped table-wordbreak'>";
    $dref->{'results_list'} .=     "\n<tr><th colspan='3'>$dref->{'test_txt'}->{'site_info1'}</th></tr>\n";
    $dref->{'results_list'} .= "<tr><td>$dref->{'test_txt'}->{'site_info2'}</td><td colspan='2'>$dref->{'os'}</td></tr>\n";
    $dref->{'results_list'} .= "<tr><td>$dref->{'test_txt'}->{'site_info3'}</td><td colspan='2'>". ( getlogin() || scalar getpwuid($>) || $dref->{'test_txt'}->{'site_infoo'} ) ."</td></tr>\n";
    $dref->{'results_list'} .= "<tr><td>$dref->{'test_txt'}->{'site_info4'}</td><td colspan='2'>$script_dir</td></tr>\n";
    $dref->{'results_list'} .= "<tr><td>$dref->{'test_txt'}->{'site_info5'}</td><td colspan='2'>$root_url</td></tr>\n";
    $dref->{'results_list'} .= "<tr><td>$dref->{'test_txt'}->{'site_info6'}</td><td colspan='2'>$Config::Config{'osname'}</td></tr>\n";
    $dref->{'results_list'} .= "<tr><td>$dref->{'test_txt'}->{'site_info7'}</td><td colspan='2'>$^O</td></tr>\n";
    $dref->{'results_list'} .= "<tr><td>$dref->{'test_txt'}->{'site_info8'}</td><td colspan='2'>$cgi_self_url</td></tr>\n";
    $dref->{'results_list'} .= "<tr><td>$dref->{'test_txt'}->{'site_info9'}</td><td colspan='2'>$script_url</td></tr>\n";
    $dref->{'results_list'} .= "<tr><td>$dref->{'test_txt'}->{'site_infoa'}</td><td colspan='2'>$dref->{'sendmail_loc'}</td></tr>\n";
    $dref->{'results_list'} .= "<tr><td>$dref->{'test_txt'}->{'site_infob'}</td><td colspan='2'>$dref->{'use_flock'}</td></tr>\n";
    $dref->{'results_list'} .= "<tr><td>$dref->{'test_txt'}->{'site_infoc'}</td><td colspan='2'>$dref->{'use_shared'}</td></tr>\n";
    $dref->{'results_list'} .= "<tr><td>$dref->{'test_txt'}->{'site_infod'}</td><td colspan='2'>$dref->{'time'}</td></tr>\n";

    #--Get UNIX specific info
    if ($dref->{'os'} =~ m/unix/i) {

        my $sendmail_loc = `whereis sendmail`;
        my $perl_loc =     `whereis perl`;
        my $ping_loc =     `whereis ping`;
        my $whois_loc =    `whereis whois`;
        my $tracer_loc =   `whereis traceroute`;
        my $finger_loc =   `whereis finger`;
        my $host_loc =     `whereis host`;
        my $nslookup_loc = `whereis nslookup`;
        my $dnsquery_loc = `whereis dnsquery`;

        my @perl =	    split(" ",$perl_loc);		if($perl[0] =~ m!^perl:$!)		    {shift @perl;}
        my @mail =	    split(" ",$sendmail_loc);	if($mail[0] =~ m!^sendmail:$!)		{shift @mail;}
        my @ping =	    split(" ",$ping_loc);		if($ping[0] =~ m!^ping:$!)		    {shift @ping;}
        my @whois =	    split(" ",$whois_loc);		if($whois[0] =~ m!^whois:$!)		{shift @whois;}
        my @tracer =	split(" ",$tracer_loc);		if($tracer[0] =~ m!^traceroute:$!)	{shift @tracer;}
        my @finger =	split(" ",$finger_loc);		if($finger[0] =~ m!^finger:$!)		{shift @finger;}
        my @host =	    split(" ",$host_loc);		if($host[0] =~ m!^host:$!)		    {shift @host;}
        my @nslookup =	split(" ",$nslookup_loc);	if($nslookup[0] =~ m!^nslookup:$!)	{shift @nslookup;}
        my @dnsquery =	split(" ",$dnsquery_loc);	if($dnsquery[0] =~ m!^dnsquery:$!)	{shift @dnsquery;}

        foreach (@perl) {
            $dref->{'results_list'} .= "<tr><td>$dref->{'test_txt'}->{'site_infoe'}</td><td colspan='2'>$_</td></tr>\n";
        }
        foreach (@mail) {
            $dref->{'results_list'} .= "<tr><td>$dref->{'test_txt'}->{'site_infof'}</td><td colspan='2'>$_</td></tr>\n";
        }
        foreach (@ping) {
            $dref->{'results_list'} .= "<tr><td>$dref->{'test_txt'}->{'site_infog'}</td><td colspan='2'>$_</td></tr>\n";
        }
        foreach (@whois) {
            $dref->{'results_list'} .= "<tr><td>$dref->{'test_txt'}->{'site_infoh'}</td><td colspan='2'>$_</td></tr>\n";
        }
        foreach (@tracer) {
            $dref->{'results_list'} .= "<tr><td>$dref->{'test_txt'}->{'site_infoi'}</td><td colspan='2'>$_</td></tr>\n";
        }
        foreach (@finger) {
            $dref->{'results_list'} .= "<tr><td>$dref->{'test_txt'}->{'site_infoj'}</td><td colspan='2'>$_</td></tr>\n";
        }
        foreach (@host) {
            $dref->{'results_list'} .= "<tr><td>$dref->{'test_txt'}->{'site_infok'}</td><td colspan='2'>$_</td></tr>\n";
        }
        foreach (@nslookup) {
            $dref->{'results_list'} .= "<tr><td>$dref->{'test_txt'}->{'site_infol'}</td><td colspan='2'>$_</td></tr>\n";
        }
        foreach (@dnsquery) {
            $dref->{'results_list'} .= "<tr><td>$dref->{'test_txt'}->{'site_infom'}</td><td colspan='2'>$_</td></tr>\n";
        }

        my $uptime = `uptime`;

        $dref->{'results_list'} .= "<tr><td>$dref->{'test_txt'}->{'site_infon'}</td><td colspan='2'>". ( $uptime || $dref->{'test_txt'}->{'site_infoo'} ) ."</td></tr>\n";
    }
    $dref->{'results_list'} .= "</table>";

    if ($dref->{'debug'}) { $dref->{'debug_list'} .= "\n<p> -- sub - site_info - end ***</p>\n"; }
}

sub server_env_info {
# -----------------------------

    my $r = shift;
    my $dref = shift;

    $dref->{'results_list'} .= &env_hash($r, $dref);
}

sub config_pm_info {
# -----------------------------

    my $r = shift;
    my $dref = shift;

    my @config_list = ();

    use Config qw(myconfig config_sh config_vars);

    if ($dref->{'debug'}) { $dref->{'debug_list'} .= "\n<p> -- sub - config_pm_info</p>\n"; }

    @config_list = split(" ", config_sh());

    $dref->{'results_list'} .= "<table class='table table-bordered table-striped table-wordbreak'>\n";
    $dref->{'results_list'} .= "<tr><th colspan='3'>$ENV{'SERVER_NAME'} $dref->{'test_txt'}->{'config_pm1'}</th></tr>\n";

    foreach (@config_list) {

        my $name = '';
        my $value = '';
        ($name, $value) = split /[=]/, $_;

        unless ($value) { $value = $dref->{'test_txt'}->{'message5'}; }

        # -- Several parameters use '<' or '>' symbols in their keys and values...(why?)
        $name = CGI::escapeHTML($name);
        # -- But keep specified breaks
        $name =~ s/&lt;br&gt;/<br \/>/g;
        $name =~ s/&lt;br \/&gt;/<br \/>/g;

        $value = CGI::escapeHTML($value);
        # -- But keep specified breaks
        $value =~ s/&lt;br&gt;/<br \/>/g;
        $value =~ s/&lt;br \/&gt;/<br \/>/g;

        $dref->{'results_list'} .= "<tr><td>$name</td><td colspan='2'>$value</td></tr>\n";
    }

    $dref->{'results_list'} .= "</table>";

    if ($dref->{'debug'}) {$dref->{'debug_list'} .= "\n<p> -- sub - config_pm_info - end ***</p>\n";}
}

sub browser_env_info {
# -----------------------------

    my $r = shift;
    my $dref = shift;

    if ($dref->{'debug'}) {$dref->{'debug_list'} .= "\n<p> -- sub - browser_env_info</p>\n";}

    $dref->{'javascript'} = qq~

<script type='text/javascript'>

var browser_text = '';

window.onload = function() {

    msos.require("msos.detection");

    // Debug provides even more stuff
    if (msos.config.debug) {
        msos.require("msos.site.detect");
    }

    function add_li_element(elem, str) {
        "use strict";

        var new_li = jQuery('<li><\/li>').text(str);
        elem.append(new_li);
    }

    msos.add_onload_function(
        function () {
            "use strict";
    
            var browser_env = {},
                dump_out = '',
                answer = 'no response',
                uagent = navigator.userAgent,
                output = '',
                browser_elm = null,
                general_ul = null,
                msos_detect_ul = null,
                modzr_detect_ul = null,
                view_size = {},
                props = '',
                kind = '',
                type = '',
                detect = '';
        
            output  = '<h2>MSOS ' + msos.version + ' $dref->{'test_txt'}->{'browser_env1'}<\/h2>';
            output += '<div class="w_medium"><ul class="msos_list">';
        
            output += '<li>MSOS Language : ' + msos.config.locale + '<\/li>';
        
            if (msos.is.Browser)	                { answer = 'true';	}
            else				                    { answer = 'false';	}
            output += '<li>Client is a browser : '  + answer + '<\/li>';
        
            if (msos.config.browser.current)	    { answer = 'true';	}
            else				                    { answer = 'false';	}
            output += '<li>Browser is current : '   + answer + '<\/li>';
        
            if (msos.config.browser.editable)	    { answer = 'true';	}
            else				                    { answer = 'false';	}
            output += '<li>Browser is editable : '  + answer + '<\/li>';
        
            if (msos.config.browser.advanced)	    { answer = 'true';	}
            else				                    { answer = 'false';	}
            output += '<li>Browser is advanced : '  + answer + '<\/li>';
        
            if (msos.config.browser.mobile)         { answer = 'true';	}
            else				                    { answer = 'false';	}
            output += '<li>Browser is mobile : '    + answer + '<\/li>';
    
            if (msos.config.browser.touch)          { answer = 'true';	}
            else				                    { answer = 'false';	}
            output += '<li>Browser is touch : '     + answer + '<\/li>';
    
            if (msos.is.FF)                         { answer = 'Ver. ' + msos.is.FF;  }
            else                                    { answer = 'false';	}
            output += '<li>Browser is FF : '        + answer + '<\/li>';
        
            if (msos.is.IE)                         { answer = 'Ver. ' + msos.is.IE;  }
            else                                    { answer = 'false';	}
            output += '<li>Browser is MSIE : '      + answer + '<\/li>';
        
            if (msos.is.Opera)                      { answer = 'Ver. ' + msos.is.Opera; }
            else                                    { answer = 'false';	}
            output += '<li>Browser is Opera : '     + answer + '<\/li>';
        
            if (msos.is.Khtml)                      { answer = 'Ver. ' + msos.is.Khtml; }
            else                                    { answer = 'false';	}
            output += '<li>Browser is KHTML : '     + answer + '<\/li>';
        
            if (msos.is.Safari)                     { answer = 'Ver. ' + msos.is.Safari; }
            else                                    { answer = 'false';	}
            output += '<li>Browser is Safari : '    + answer + '<\/li>';
        
            if (msos.is.Mozilla)                    { answer = 'Ver. ' + msos.is.Mozilla; }
            else                                    { answer = 'false';	}
            output += '<li>Browser is Mozilla : '   + answer + '<\/li>';
        
            if (msos.is.Chrome)                     { answer = 'Ver. ' + msos.is.Chrome; }
            else                                    { answer = 'false';	}
            output += '<li>Browser is Chrome : '    + answer + '<\/li>';
        
            if (msos.is.WebKit)                     { answer = 'Ver. ' + msos.is.WebKit; }
            else                                    { answer = 'false';	}
            output += '<li>Browser is WebKit : '    + answer + '<\/li>';
        
            if (msos.is.Quirks)                     { answer = 'true';	}
            else                                    { answer = 'false';	}
            output += '<li>Quirks mode : '          + answer + '<\/li>';
        
            if (msos.is.AIR)                        { answer = 'true';	}
            else                                    { answer = 'false';	}
            output += '<li>Adobe Air : '            + answer + '<\/li>';
        
            output += '<\/ul><\/div>';
            output += '<h2>Your Browser Agent<\/h2>';
            output += '<h3>'  + uagent +    '<\/h3>';
        
            browser_elm = jQuery('#browser_detection');
            browser_elm.html(output);
        
            general_ul = jQuery('<ul class="msos_list"><\/ul>');
            view_size = msos.config.view_port;

            add_li_element(general_ul, '$dref->{'test_txt'}->{'browser_envi'}: ' + (!navigator.javaEnabled() ? '$dref->{'test_txt'}->{'browser_envj'} ' : '') + '$dref->{'test_txt'}->{'browser_envk'}');
            add_li_element(general_ul, '$dref->{'test_txt'}->{'browser_env2'}: ' + navigator.appCodeName);
            add_li_element(general_ul, '$dref->{'test_txt'}->{'browser_env3'}: ' + navigator.appName);
            add_li_element(general_ul, '$dref->{'test_txt'}->{'browser_env4'}: ' + navigator.appVersion);
            add_li_element(general_ul, '$dref->{'test_txt'}->{'browser_env5'}: ' + navigator.userAgent);
            add_li_element(general_ul, '$dref->{'test_txt'}->{'browser_env6'}: ' + navigator.language);
            add_li_element(general_ul, '$dref->{'test_txt'}->{'browser_env7'}: ' + navigator.platform);
            add_li_element(general_ul, '$dref->{'test_txt'}->{'browser_env8'}: ' + navigator.cpuClass);
            add_li_element(general_ul, '$dref->{'test_txt'}->{'browser_env9'}: ' + navigator.browserLanguage);
            add_li_element(general_ul, '$dref->{'test_txt'}->{'browser_enva'}: ' + navigator.cookieEnabled);
            add_li_element(general_ul, '$dref->{'test_txt'}->{'browser_envb'}: ' + navigator.userLanguage);
            add_li_element(general_ul, '$dref->{'test_txt'}->{'browser_envc'}: ' + navigator.systemLanguage);
            add_li_element(general_ul, '$dref->{'test_txt'}->{'browser_envd'}: ' + navigator.onLine);

            for (props in msos.detection.plugins) {
                if (msos.detection.plugins.hasOwnProperty(props)) {
                    add_li_element(general_ul, props + ' : ' + msos.detection.plugins[props]);
                }
            }

            jQuery('#general').append(general_ul);

            msos_detect_ul = jQuery('<ul class="msos_list"><\/ul>');

            add_li_element(msos_detect_ul, 'view_port.height : ' + view_size.height);
            add_li_element(msos_detect_ul, 'view_port.width : '  + view_size.width);

            for (kind   in msos.config.file) {
                if (msos.config.file.hasOwnProperty(kind)) {
                    add_li_element(msos_detect_ul, 'file.' + kind + ' : '       + msos.config.file[kind]);
                }
            }
            for (type   in msos.config.touch) {
                if (msos.config.touch.hasOwnProperty(type)) {
                    add_li_element(msos_detect_ul, 'touch.' + type + ' : '      + msos.config.touch[type]);
                }
            }
            add_li_element(msos_detect_ul, 'orientation : '	+ msos.config.orientation);

            jQuery('#msos_detect').append(msos_detect_ul);

            modzr_detect_ul = jQuery('<ul class="msos_list"><\/ul>'); 

            for (detect in Modernizr) {
                if (Modernizr.hasOwnProperty(detect)) {
                    if (typeof Modernizr[detect] === 'boolean') {
                        add_li_element(modzr_detect_ul, 'Modernizr.' + detect + ' : ' + Modernizr[detect]);
                    }
                }
            }

            jQuery('#modernizr_detect').append(modzr_detect_ul);

            if (msos.config.debug
            && !msos.config.debug_timing
            && !msos.config.debug_event) {
                // msos.site.detect bundles all user profile output
                browser_env = msos.site.detect.browser();
                dump_out = JSON.stringify(browser_env, null, '\t');
                setTimeout(function () { msos.debug.write(dump_out); }, 2000);
            }

            // Clean-up
            jQuery('#font_size_test').css('display', 'none');
        }
    );
}

</script>
~;

    $dref->{'results_list'} .= qq~

		<div id='browser_detection'>
			<span class='alert'>Browser not detected!</span>
		</div>

		<h3>Plugin Detection</h3>

		<div id="general" class="w_medium"></div>

		<h3>MSOS Detection</h3>

		<div id="msos_detect" class="w_medium"></div>

		<h3>Modernizr Detection</h3>

		<div id="modernizr_detect" class="w_medium"></div>

		<div id='font_size_test' style='visibility:hidden;'>
		  <!-- These spans are used to calculate browse dependent font widths
			   for a given generic font size -->
		  <span id='xl' style='font-size:x-large;' >Open Source</span><br />
		  <span id='lg' style='font-size:large;'   >Open Source</span><br />
		  <span id='md' style='font-size:medium;'  >Open Source</span><br />
		  <span id='sm' style='font-size:small;'   >Open Source</span><br />
		  <span id='xs' style='font-size:x-small;' >Open Source</span><br />
		  <span id='xx' style='font-size:xx-small;'>Open Source</span>
		</div>
~;

    if ($dref->{'debug'}) {$dref->{'debug_list'} .= "\n<p> -- sub - browser_env_info - end ***</p>\n";}
}
