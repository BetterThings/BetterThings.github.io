#!/usr/bin/perl
use utf8;
use warnings;
use diagnostics;
#
# Copyright Notice:
my $script_name = 'Site-Tester';
my $script_vers = '14.4.16';
my $script_date = 'Apr. 16, 2014';
my $script_year = '2014';

#  Copyright© - OpenSiteMobile
my $copyright_year = '2008-2014';

#  All rights reserved
#
# Description:
#
# Site-Tester is a simple perl script used to test the availability of standard perl modules
# required by MobileSiteOS™ (ref. %modules). It is a more sophisticated version of Site-Simple
# in that it tests several Perl Modules for functionality (LWP, Net::SSL/IO::Socket::SSL/Net::SSLeay).
# It also checks for availabilty/functionality of the DBI and XML::Parser Perl modules.
#
# Contact Information:
#
# Author: Dwight Vietzke Jr.
# Email:  dwight_vietzke@yahoo.com
#


# ==========================================================================
#     Beginning of script...
# ==========================================================================

use CGI::Carp qw(fatalsToBrowser set_message);
use CGI qw(:cgi);
use Config;
use lib ('./lib');
use MSOS::Base;
use strict;

$CGI::POST_MAX=1024 * 25;	# max 25K posts
$CGI::DISABLE_UPLOADS = 1;	# no uploads
$CGI::HEADERS_ONCE = 1;		# one set of HTTP headers please

BEGIN { set_message(\&MSOS::Base::handle_errors); }

my %def = ();
my %modules = ();

my $q = new CGI;

%modules = (

	'useragent'		=> [ 'LWP::UserAgent',		'' ],
	'net_ssl'		=> [ 'Net::SSL',			'' ],
    'io_socket_ssl' => [ 'IO::Socket::SSL',     '' ],
	'template'		=> [ 'HTML::Template',		'' ],
	'mailer'		=> [ 'Mail::Mailer',		'' ],
	'mail_sendmail'	=> [ 'Mail::Sendmail',		'' ],
	'memoize'		=> [ 'Memoize',				'' ],
	'mime_base64'	=> [ 'MIME::Base64',		'' ],
	'mime_types'	=> [ 'MIME::Types',			'' ],
	'mime_quotedp'	=> [ 'MIME::QuotedPrint',	'' ],
	'mime_lite'		=> [ 'MIME::Lite',			'' ],
	'mime_words'	=> [ 'MIME::Words',			'' ],
	'net_dns'		=> [ 'Net::DNS',			'' ],
	'net_domain_tld'=> [ 'Net::Domain::TLD',	'' ],
	'net_cmd'		=> [ 'Net::Cmd',			'' ],
	'net_config'	=> [ 'Net::Config',			'' ],
    'net_https'     => [ 'Net::HTTPS',			'' ],
	'net_netrc'		=> [ 'Net::Netrc',			'' ],
	'net_pop3'		=> [ 'Net::POP3',			'' ],
	'net_smtp'		=> [ 'Net::SMTP',			'' ],
	'xml_simple'	=> [ 'XML::Simple',			'' ],
	'xml_parser'	=> [ 'XML::Parser',			'' ],
	'dbi'			=> [ 'DBI',					'' ],
	'sql_statement'	=> [ 'SQL::Statement',		'' ],
	'dbd_file'		=> [ 'DBD::File',			'' ],
	'dbd_anydata'	=> [ 'DBD::AnyData',		'' ],
	'anydata'		=> [ 'AnyData',				'' ],
	'accessor'		=> [ 'Class::Accessor',		'' ],
	'xpath'			=> [ 'XML::XPath',			'' ],
	'email_valid'	=> [ 'Email::Valid',		'' ],
	'webservice'	=> [ 'WebService::Validator::HTML::W3C', '' ]
);

%def = (

	'drivers_list'	=> '',
	'error_list'	=> '',
	'not'			=> "<span style='color: red;'>not</span>",
	'modules_list'	=> '',
	'run_test'		=> 'yes',

    'script_url'    => $q->url,

	'test_txt' => {

		'message3'	=>  'CGI Environment Variables',
		'message4'	=>  'not defined',
		'message5'	=>  'Perl Information',
		'message6'	=>  'Perl Exe',
		'message7'	=>  'Perl Version',
		'message8'	=>  'CGI.pm Version',
		'message9'	=>  'Carp.pm Version'
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

# -- Check the op system...
$def{'os'} = $CGI::OS;


eval { require 5.008; };
if ($@) {

	$def{'run_test'} = 'no';

	if ($def{'os'} =~ m/windows/i) {

		$def{'error_list'} .= "<h2><span class='alert bold_text'>This script is running under Perl $]!</span></h2>\n"
							. "<p><span class='bold_text'>All MobileSiteOS scripts require Perl 5.8.1 or above. You will have to\n"
							. " request that your web server be upgraded or have your site moved to a server that is currently\n"
							. " running Perl 5.8.1 or above.</span></p>\n";

		if ($q->param('more_info')) {

			$def{'error_list'} .= "<p>Presently, your server reports that it is executing from $^X,<br />\n"
								. "which is running Perl version $]!</p>\n";
		}
	} else {

		$def{'error_list'} =  "<h2><span class='alert bold_text'>You may need to reset the path this script is using to Perl!</span></h2>\n"
							. "<p><span class='bold_text'>All OpenSiteMobile scripts require Perl 5.8.1 or above. You may have\n"
							. " to edit this script's path to Perl or request that your web server be upgraded to\n"
							. " at least Perl 5.8.1.</span></p>\n";

		if ($q->param('perl')) {

			$def{'error_list'} .= "<p>Presently, the first line of this script is set to \#\!$^X,<br />\n"
								. "which is pointing to Perl version $]!</p>\n";
		}
	}
	if ($q->param('perl')) {

		$def{'error_list'} .= "<p>Perl Response:<br /><br />$@</p>\n";

	} else {

		$def{'error_list'} .= "\n<form action='$def{'script_info'}{'script_url'}' method='get'><p>\n"
							. "<input type='submit' name='perl' value='More Info' /></p></form>\n";
	}
	$@ = '';
}


eval { require LWP::UserAgent; };
if ($@) {

	$modules{'useragent'}[1] = $def{'not'};

	$def{'run_test'} = 'no';
	$def{'error_list'} .= "<h2><span class='alert bold_text'>The LWP::UserAgent Perl Module was not found on this server!</span></h2>\n"
						. "<p><span class='bold_text'>Most OpenSiteMobile scripts require that the LWP and HTTP libraries of modules be installed.\n"
						. " This allows communications with other web servers to be established. You will have to request that\n"
						. " your web server be loaded with the latest versions of the LWP:: and HTTP:: families of Perl modules.</span></p>\n";

	if ($q->param('lwp')) {

		$def{'error_list'} .= "<p>Perl Response:<br /><br />$@</p>\n";
	} else {

		$def{'error_list'} .= "\n<form action='$def{'script_info'}{'script_url'}' method='get'><p>\n"
							. "<input type='submit' name='lwp' value='More Info' /></p></form>\n";
	}
	$@ = '';
}


eval { require XML::Parser; };
if ($@) {

	$modules{'xml_parser'}[1] = $def{'not'};

	$def{'run_test'} = 'no';

	$def{'error_list'} .= "<h2><span class='alert bold_text'>The XML::Parser Perl Module was not found on this server!</span></h2>\n"
						. "<p><span class='bold_text'>Many OpenSiteMobile scripts require that XML::Parser or XML::SAX (SAX2) libraries be installed.\n"
						. " This permits the reading of XML documents from other web servers. You will have to request that\n"
						. " your web server be loaded with the latest version of the XML::Parser or XML::SAX families of Perl modules.\n"
						. " They are typically accessed by the XML::Simple Perl module in MobileSiteOS scripts.</span></p>\n";

	if ($q->param('parser')) {

		$def{'error_list'} .= "<p>Perl Response (XML::Parser):<br /><br />$@";

	} else {

		$def{'error_list'} .= "\n<form action='$def{'script_info'}{'script_url'}' method='get'><p>\n"
							. "<input type='submit' name='parser' value='More Info' /></p></form>\n";
	  }
	$@ = '';
}


eval { require Net::SSL; };
if ($@) {

	$modules{'net_ssl'}[1] = $def{'not'};

	my $error_ssl = $@;
	$error_ssl .= '<br /><br />Please note: The Crypt::SSLeay package contains Net::SSL, which is automatically loaded by LWP::Protocol::https on HTTPS requests.';
	$@ = '';

	eval { require IO::Socket::SSL; };
	if ($@) {

		$error_ssl .= "<br /><br />Perl Response (IO::Socket):<br /><br />$@";
		$error_ssl .= '<br /><br />Please note: In order to use the IO::Socket::SSL module, the server needs to have Net_SSLeay v1.03 or newer installed.';
		$@ = '';

		eval { require Net::SSLeay; };
		if ($@) {

			$def{'run_test'} = 'no';
			$error_ssl .= "<br /><br />Perl Response (Net::SSLeay):<br /><br />$@";
			$error_ssl .= '<br /><br />Please note: In order to use OpenSSL encryption, the server needs to have Net::SSLeay or Crypt::SSLeay installed.';

			$def{'error_list'} .= "<h2><span class='alert bold_text'>The Net::SSL, IO::Socket::SSL or Net::SSLeay Perl Modules were not found on this server!</span></h2>\n"
								. "<p><span class='bold_text'>Many OpenSiteMobile scripts require that one of these modules be installed.\n"
								. " These modules allow for secure communications with other web servers using the libwww-perl library, via the HTTPS protocol.\n"
								. " You will have to request that your web server be loaded with the latest version of one of these Perl modules.</span></p>\n";

			if ($q->param('ssl')) {

				$def{'error_list'} .= "<p>Perl Response (Net::SSL):<br /><br />$error_ssl</p>\n";

			} else {

				$def{'error_list'} .= "\n<form action='$def{'script_info'}{'script_url'}' method='get'><p>\n"
									. "<input type='submit' name='ssl' value='More Info' /></p></form>\n";
			  }
			$@ = '';
		}
	}
}

if ($def{'run_test'} eq 'yes') {

	my $xml = '';
	my $request = '';
	my $response = '';
	my $response_content = '';
	my $url = 'https://wwwcie.ups.com/ups.app/xml/Rate';   # -- Test web server for the UPS rate calculator

	$xml = LWP::UserAgent->new();
	$xml->agent("MobileSiteOS/0.1 " . $xml->agent);

	$request = HTTP::Request->new('POST' => $url);
	$request->content_type('application/x-www-form-urlencoded');
	$request->content('test=mobilesiteos&xml=no_data');

	$def{'error_list'} .= "<h2><span class='alert bold_text'>Testing the HTTPS communications capabilities of this server!</span></h2>\n"
						. "<p><span class='bold_text'>Site-Tester confirmed that the necessary Perl modules were in place to attempt\n"
						. " secure communications with other web servers via the HTTPS protocol. Below is the result of an\n"
						. " attempted 'trial' communication with a typical secure internet server.</span><br /><br />Note, even a\n"
						. " negative <span class='bold_text'>SSL Server Response</span> can indicate that the communications were successful.</p>\n";

	$response = $xml->request($request);

	$response_content = $response->content || 'na';
	$response_content = CGI::escapeHTML($response_content);

	if ($response->is_success)	{ $def{'error_list'} .= "<p><span class='bold_text'>SSL Server Response:</span></p>\n<div class='' style='overflow:auto;'><pre title='HTTPS Server Response'>" . $response_content . "</pre></div>\n"; }
	else						{ $def{'error_list'} .= "<p><span class='bold_text'>LWP Error Response:</span><br /><br />" . $response->status_line . "</p>\n"; }
}

foreach (keys %modules) {
	if (/useragent|xml_parser|net_ssl|dbi/) { next; }
	my $test_for_module = 'require ' . $modules{$_}[0] . ';';
	eval $test_for_module;
	if ($@) { $modules{$_}[1] = $def{'not'}; $@ = ''; }
}

eval { require DBI; };
if ($@) { $modules{'dbi'}[1] = $def{'not'}; $@ = ''; }
else {

	my $drv_errors = '';
	my $drv_warnings = '';
	my @drivers = ();

	eval { @drivers = DBI ->available_drivers; };

	if ($@) {

		my $warning = $@;
		$warning =~ s/--/-x-/g;	# Two dashes together inside comment tags causes problems sometimes...

		$drv_warnings = "\n <!-- $warning --> \n";

		$drv_errors .= "<span class='bold_text' title='See hidden html comments for more DBI driver info'>\n";
		$drv_errors .= "<span class='accent'>*</span></span>\n";
		$@ = '';
	}
	
	$def{'drivers_list'} .= "<table class='table table-bordered table-striped table-wordbreak'>\n";
	$def{'drivers_list'} .= "<tr><th>DBI Drivers</th><th>DBI Source$drv_errors</th></tr>\n";
	unless (@drivers) {

		$def{'drivers_list'} .= "<tr><td>No drivers</td>\n<td>No data sources</td></tr>\n";

	} else {

		my $drv = '';

		foreach $drv (@drivers) {

			my $untainted = '';
			my @datasource = ();

			if ($drv =~ m/^([A-Za-z0-9_.]+)$/)	{ $untainted = $1; }
			unless ($untainted) {
				$def{'drivers_list'} .= "<tr><td>$drv</td><td>No data source</td></tr>\n";
			}
			eval { @datasource = DBI->data_sources( $untainted ); };
			if ($@) {

				$def{'drivers_list'} .= "<tr><td>$drv</td><td><span class='bold_text' title='See hidden html comments for more DBI source info'><span class='accent'>Module Problems?</span></span></td></tr>\n";
				my $warning = $@;
				$warning =~ s/--/-x-/g;	# Two dashes together inside comment tags causes problems sometimes...

				$drv_warnings .= "\n <!-- $warning --> \n";
				$@ = '';
			} else {
				foreach ( @datasource ) {
					$def{'drivers_list'} .= "<tr><td>$drv</td><td class='contrast1'>$_</td></tr>\n";
				}
			}
		}
	}
	$def{'drivers_list'} .= "</table>";
	$def{'drivers_list'} .= "\n <!-- Here are some warnings --> \n" . $drv_warnings if $drv_warnings;
}

$def{'modules_list'}  = "<table class='table table-bordered table-striped table-wordbreak'>\n";
$def{'modules_list'} .= "<tr><th colspan='2'>Key Modules List</th></tr>\n";

foreach (sort {$a cmp $b} keys %modules) {
	$def{'modules_list'} .= "<tr><td>$modules{$_}[0]</td><td>$modules{$_}[1] installed</td></tr>\n";
}

$def{'modules_list'} .= "</table>";


# -- Debugging and tests
if ($def{'debug'}) {
	&MSOS::Base::run_debugging( $q, \%def );
}


#  Script Output Section
# ===========================

binmode(STDOUT, ":utf8");

print $q->header(

	-type		=> $def{'content_type'},
	-expires	=> 'now',
	-last_modified	=> scalar(gmtime)
);

&print_body($q, \%def);


#  End of Script
# =========================================================



#  SUBROUTINES
# =========================================================

sub print_body {
# -----------------------------

	my $r = shift;
	my $dref = shift;

	my $key = '';

	print "\t<section>\n<h2>$dref->{'script_info'}->{'name'} v$dref->{'script_info'}->{'version'}</h2>\n";
	print "<div style='padding:0px 5px 5px 5px;'>$dref->{'error_list'}</div>\n<br />\n";

	print $dref->{'modules_list'};

	print $dref->{'drivers_list'};

	print "<table class='table table-bordered table-striped table-wordbreak'>\n";
	print "<tr><th colspan='3'>$dref->{'test_txt'}->{'message3'}</th></tr>\n";

	foreach $key ( sort keys %ENV ) {

		my $value = '';

		$value = $ENV{$key} || $dref->{'test_txt'}->{'message4'};
		$value =~ s/;/; /g;
		$value =~ s/&/ &/g;
		$key =~ s/_/ /g;

		$value = CGI::escapeHTML($value);

		print "<tr><td>$key</td><td colspan='2'>$value</td></tr>\n";
	}
	print "</table>";

	print "<table class='table table-bordered table-striped table-wordbreak'>\n";
	print "<tr><th colspan='3'>$dref->{'test_txt'}->{'message5'}</th></tr>\n";
	print "<tr><td>$dref->{'test_txt'}->{'message6'}</td><td colspan='2'>$^X</td></tr>\n";
	print "<tr><td>$dref->{'test_txt'}->{'message7'}</td><td colspan='2'>$]</td></tr>\n";
	print "<tr><td>$dref->{'test_txt'}->{'message8'}</td><td colspan='2'>$CGI::VERSION</td></tr>\n";
	print "<tr><td>$dref->{'test_txt'}->{'message9'}</td><td colspan='2'>$CGI::Carp::VERSION</td></tr>\n";
	print "</table>\n\t</section>\n";
}

