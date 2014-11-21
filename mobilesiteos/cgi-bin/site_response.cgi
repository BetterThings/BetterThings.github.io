#!/usr/bin/perl
use utf8;
use open ':utf8';
use Encode;
use warnings;
use diagnostics;
#
# Copyright Notice:
my $script_name = 'Site-Response';
my $script_vers = '14.4.16';
my $script_date = 'Apr. 16, 2014';
my $script_year = '2014';

#  Copyright© - OpenSiteMobile
my $copyright_year = '2008-2014';

#  All rights reserved
#
# Description:
#
# Site-Respone is a simple perl script used to examime the HTTP server response to different
# HTTP server requests.
#
# Contact Information:
#
# Author: Dwight Vietzke Jr.
# Email:  dwight_vietzke@yahoo.com
#


# ==========================================================================
#     Beginning of script...
# ==========================================================================

use CGI::Carp qw(fatalsToBrowser warningsToBrowser set_message);
use CGI qw(:cgi);
use lib ('./lib');
use LWP::UserAgent;
use HTTP::Request;
use MSOS::Base;
use strict;

$CGI::POST_MAX=1024 * 25;	# max 25K posts
$CGI::DISABLE_UPLOADS = 1;	# no uploads
$CGI::HEADERS_ONCE = 1;		# one set of HTTP headers please

BEGIN { set_message(\&MSOS::Base::handle_errors); }

my %def = ();
my $q = new CGI;

for my $p ($q->param) {
	my @v = map {Encode::decode('utf8',$_)} $q->param($p);
	$q->param($p,@v);
}

%def = (

    'script_url'    => $q->url,

	'resp_txt' => {

		'http_msg1'	=>  'HTTP Header Inputs',
		'http_msg2'	=>  'HTTP Version:',
		'http_msg3'	=>  'With host name',
		'http_msg4'	=>  'Without host name',
		'http_msg5'	=>  'Request Type:',
		'http_msg6'	=>  'Accept-Charset:',
		'http_msg8'	=>  'HTTP Request',
		'http_msg9'	=>  'Problem making an HTTP connection!',
		'http_msga'	=>  'HTTP Response',
		'http_msgb'	=>  'Check Another Website or Page',
		'http_msgc'	=>  'Please note: HTTP headers may differ between scripts and static pages!',
		'http_msgd'	=>  'Check HTTP Header Info',
		'http_msge'	=>  'Output saved to:',
		'http_msgf'	=>  'Page Output Available'
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

# -- Debugging and tests
if ($def{'debug'}) {
	&MSOS::Base::run_debugging( $q, \%def );
}


#  Script Output Section
# ===========================

&print_body($q, \%def);


#  End of Script
# =========================================================



#  SUBROUTINES
# =========================================================

sub print_body {
# -----------------------------

	my $r = shift;
	my $dref = shift;

	my $output = '';
	my $out_chse = '';
	my $out_gzip = '';
	my $out_type = '';
	my $out_vers = '';
	my $request_chse = $r->param('http_chse')	|| 'utf8';
	my $request_gzip = $r->param('use_gzip')	|| 'no';
	my $request_type = $r->param('http_type')	|| 'head';
	my $request_vers = $r->param('http_vers')	|| 'vers_11';
	my $request_url	 = $r->param('http_resp')	|| 'http://google.com';

	my @http_chse = Encode->encodings();
	my %http_chse = ();

	# -- Encode uses the 'key', while
	#	 the HTTP request uses the 'value'

	my %encode_avail = (

		'ascii'		=> 'us-ascii',
		'utf8'		=> 'utf8',
		'utf-8-strict'	=> 'utf-8',
		'iso-8859-1'	=> 'iso-8859-1',
		'iso-8859-2'	=> 'iso-8859-2',
		'iso-8859-3'	=> 'iso-8859-3',
		'iso-8859-4'	=> 'iso-8859-4',
		'iso-8859-5'	=> 'iso-8859-5',
		'iso-8859-6'	=> 'iso-8859-6',
		'iso-8859-7'	=> 'iso-8859-7',
		'iso-8859-8'	=> 'iso-8859-8',
		'iso-8859-9'	=> 'iso-8859-9',
		'iso-8859-10'	=> 'iso-8859-10',
		'iso-8859-11'	=> 'iso-8859-11',
		'iso-8859-13'	=> 'iso-8859-13',
		'iso-8859-14'	=> 'iso-8859-14',
		'iso-8859-15'	=> 'iso-8859-15',
		'iso-8859-16'	=> 'iso-8859-16',
		'koi8-f'	=> 'koi8-f',
		'koi8-r'	=> 'koi8-r',
		'koi8-u'	=> 'koi8-u',
		'shift_jis'	=> 'shift_jis',
		'euc-jp'	=> 'euc-jp',
		'iso-2022-jp'	=> 'iso-2022-jp',
		'iso-2022-jp-1'	=> 'iso-2022-jp-1',
		'7bit-jis'	=> '7bit-jis',
		'euc-kr'	=> 'euc-kr',
		'big5'		=> 'big5',
		'big5-eten'	=> 'big5-eten',
		'big5-hkscs'	=> 'big5-hkscs',
		'gb2312'	=> 'gb2312',
		'viscii'	=> 'viscii',
	);

	my %http_type = (

		'get'	=> 'GET',
		'post'	=> 'POST',
		'head'	=> 'HEAD',
		'trace'	=> 'TRACE',
	);

	my %http_vers = (

		'vers_11'	=> [ 'HTTP/1.1', "<abbr title=\"$dref->{'resp_txt'}->{'http_msg3'}\">HTTP/1.1</abbr>"  ],
		'vers_10'	=> [ 'HTTP/1.0', "<abbr title=\"$dref->{'resp_txt'}->{'http_msg4'}\">HTTP/1.0</abbr>"  ],
	);

	foreach (@http_chse) {

		if ($encode_avail{$_}) { $http_chse{$_} = $encode_avail{$_}; }
	}

	foreach (keys %http_chse) {

		if ($request_chse eq $_)	{ $out_chse .= "&nbsp;&nbsp;<input type='radio' name='http_chse' value='$_' checked='checked' /><span class='bold_text' title='$http_chse{$_}'>$_</span>\n";	}
		else						{ $out_chse .= "&nbsp;&nbsp;<input type='radio' name='http_chse' value='$_' /><span class='bold_text' title='$http_chse{$_}'>$_</span>\n";						}
	}

	foreach (keys %http_type) {

		if ($request_type eq $_)	{ $out_type .= "&nbsp;&nbsp;<input type='radio' name='http_type' value='$_' checked='checked' />$http_type{$_}\n";	}
		else						{ $out_type .= "&nbsp;&nbsp;<input type='radio' name='http_type' value='$_' />$http_type{$_}\n";					}
	}

	foreach (keys %http_vers) {

		if ($request_vers eq $_)	{ $out_vers .= "&nbsp;&nbsp;<input type='radio' name='http_vers' value='$_' checked='checked' />$http_vers{$_}[1]\n";	}
		else						{ $out_vers .= "&nbsp;&nbsp;<input type='radio' name='http_vers' value='$_' />$http_vers{$_}[1]\n";						}
	}

	if ($request_gzip eq 'yes')		{ $out_gzip = "&nbsp;&nbsp;<input type='checkbox' name='use_gzip' value='yes' checked='checked' />\n";	}
	else							{ $out_gzip = "&nbsp;&nbsp;<input type='checkbox' name='use_gzip' value='yes' />\n";					}

	if (!$request_url =~ m!^https?://.*!) { $request_url = 'http://' . $request_url; }

	# -- Start building our form...

$output = qq~<h3>$dref->{'resp_txt'}->{'http_msg1'}</h3>
		<form method='get' class="form" action='$dref->{'script_url'}'>
			<div class='row'>
				<div class='span4 text_rt'><label>$dref->{'resp_txt'}->{'http_msg2'}</label></div>
				<div class='span8 text_lt'>$out_vers</div>
			</div>
			<div class='row'>
				<div class='span4 text_rt'><label>$dref->{'resp_txt'}->{'http_msg5'}</label></div>
				<div class='span8 text_lt'>$out_type</div>
			</div>
			<div class='row'>
				<div class='span4 text_rt'><label>$dref->{'resp_txt'}->{'http_msg6'}</label></div>
				<div class='span8 text_lt'>$out_chse</div>
			</div>
			<div class='row'>
				<div class='span4 text_rt'>
					<label><abbr title="HyperText Transfer Protocol">HTTP</abbr> URL - <span class='alert'>(<abbr title="Internationalized domain names allowed">IDN</abbr>)</span>:</label>
				</div>
				<div class='span8 text_lt'>&nbsp;&nbsp;<input type='text' class='span7' name='http_resp' value='$request_url' /></div>
			</div>
			<div class='row'>
				<div class='span4 text_rt'><label>Accept-Encoding:</label></div>
				<div class='span8 text_lt'>$out_gzip gzip</div>
			</div>
			<div class='row'>
				<div class='span12'><input type='submit' class="btn btn-success" /></div>
			</div>
		</form>
~;

	if ($r->param('http_resp') && ($r->param('http_resp') ne '')) {

		my $content_type = '';
		my $meta_charset = '';
		my $meta_type = '';
		my $resp_charset = '';
		my $encode = '';
		my $encode_flag = 'no';
		my $header = '';
		my $page = '';
		my $page_out = $ENV{'DOCUMENT_ROOT'} || $ENV{'SITE_HTMLROOT'} || '';
		my $request = '';
		my $request_agnt = $ENV{'HTTP_USER_AGENT'} || '';
		my $request_accp = 'image/gif, image/x-xbitmap, image/jpeg, image/pjpeg, application/x-shockwave-flash, */*';
		my $request_host = '';
		my $request_path = '';
		my $request_port = '';
		my $request_qury = '';

		if ($http_type{$request_type})	{ $request_type = $http_type{$request_type};	}
		else							{ $request_type = 'HEAD';						}

		if ($http_vers{$request_vers})	{ $request_vers = $http_vers{$request_vers}[0];	}
		else							{ $request_vers = 'HTTP/1.1';					}

		if ($http_chse{$request_chse})	{ $request_chse = $http_chse{$request_chse};	}
		else							{ $request_chse = 'utf8';						}

		require URI;

		my $url = URI->new($request_url);

		$request_host = $url->host;
		$request_port = $url->port || 80;
		$request_path = $url->path || '/';
		$request_qury = $url->query_form || '';

		# -- Lets get the page...

		my $ua = LWP::UserAgent->new();
		   $ua->agent("$request_agnt $dref->{'script_info'}->{'name'} v$dref->{'script_info'}->{'version'}");

		if ($request_type eq 'POST') { $request_url = 'http://' . $request_host . $request_path; }

		my $http_req = HTTP::Request->new($request_type => $request_url);
			$http_req->protocol($request_vers);
		if ($request_type eq 'POST') {
			$http_req->content_type('application/x-www-form-urlencoded');
			$http_req->content($request_qury) if $request_qury;
		} else {
			$http_req->header('Content-length'	=> '0');
		  }
			$http_req->header('Connection'		=> 'close');
			$http_req->header('Accept'			=> $request_accp);
			$http_req->header('Accept-Charset'	=> $request_chse);
		if ($r->param('use_gzip') && ($r->param('use_gzip') eq 'yes')) {
			$http_req->header('Accept-Encoding'	=> 'compress, gzip'	);
		}

		my $response = $ua->request($http_req);

		($header, $page) = split( /\n\s*\n/, $response->as_string, 2 ) unless $response->is_error();

		$request= $http_req->as_string;

		$page_out .= '/' if $page_out;
		$page_out .= 'site_response_out.txt';

		$content_type = $response->header('Content-Type') || 'na';
	
		unless ($content_type eq 'na') {
	
			foreach (keys %http_chse) {
				my $temp_regex = $http_chse{$_};
				if ($content_type =~ m/charset\s*=\s*\Q$temp_regex\E/i) {
					$encode = $_;
					$encode_flag = 'yes';
					$resp_charset = $http_chse{$_};
				}
			}
		}

		if ($page) {

			if($page =~ m/<META\s+HTTP-EQUIV\s*=\s*"?Content-Type"?\s+content\s*=\s*"(.*);\s+charset\s*=\s*([\w\d-]+)"\s*\/?>/i) {
				$meta_type = $1 || 'na';
				$meta_charset = $2 || 'na';
			}
			unless ($encode_flag eq 'yes') {

				if ($meta_charset) {
					foreach (keys %http_chse) {
						my $match = $http_chse{$_};
						if ($meta_charset =~ m/$match/i) { $encode = $_; $encode_flag= 'yes'	}
					}
				}
			}
			if ($encode_flag ne 'yes') { $encode = 'iso-8859-1'; }

			# -- Output the file with our best guess as to charset...

			 open FILE, ">:encoding($encode)", $page_out;
			print FILE $page;
			close FILE;
		}

		binmode(STDOUT, ":utf8");
		print $r->header(

			-type		=> $dref->{'content_type'},
			-expires	=> 'now',
			-last_modified	=> scalar(gmtime)
		);

		print "\t<section>\n<h2>$dref->{'script_info'}->{'name'} v$dref->{'script_info'}->{'version'}</h2>\n";
		print "<h2>$dref->{'resp_txt'}->{'http_msg8'}</h2>\n";
		print "<div style='overflow: scroll; border: 2px inset;'><pre>\n";
		print $request;
		print "</pre></div>\n";

		unless ($header) {
			$header  = "$dref->{'resp_txt'}->{'http_msg9'}\n";
			$header .= 'HTTP::Response: ' . $response->status_line . "\n" unless $response->is_success;
		}

		print "<h2>$dref->{'resp_txt'}->{'http_msga'}</h2>\n";
		print "<div style='overflow: scroll; border: 2px inset;'><pre>\n";
		print CGI::escapeHTML($header);
		print "</pre></div><br />\n";
	
		print "<hr />\n<h2>$dref->{'resp_txt'}->{'http_msgb'}<span class='alert' title='$dref->{'resp_txt'}->{'http_msgc'}'>*</span></h2>\n";
		print $output;

		if ($page) {
			print "<p title='$dref->{'resp_txt'}->{'http_msge'} $page_out'>\n";
			print "<span class='bold_text'>$dref->{'resp_txt'}->{'http_msgf'}</span> ($encode)<br />\n";
			print "Head Charset: $resp_charset<br />\n" if $resp_charset;
			print "Meta Charset: $meta_charset<br />\n" if $meta_charset;
			# print "REF: $content_type, Type: $meta_type, Charset: $meta_charset<br />\n";
			print "</p>";
		}
		print "\n\t</section>\n";

	} else {

		binmode(STDOUT, ":utf8");
		print $r->header(

			-type		=> $def{'content_type'},
			-expires	=> 'now',
			-last_modified	=> scalar(gmtime)
		);

		print "\t<section>\n<h2>$dref->{'script_info'}->{'name'} v$dref->{'script_info'}->{'version'}</h2>\n";
		print "<h2>$dref->{'resp_txt'}->{'http_msgd'}</h2>\n";
		print $output;

		# print "<h3>@http_chse</h3>";
		print "\n\t</section>\n";

	  }
}
