#!/usr/bin/perl
use utf8;
use open ':utf8';
use Encode 'decode_utf8';
use warnings;
use diagnostics;
#
# Copyright Notice:
my $script_name = 'Site-Text-Display';
my $script_vers = '14.4.16';
my $script_date = 'Apr. 16, 2014';
my $script_year = '2014';

#  Copyright© - OpenSiteMobile
my $copyright_year = '2008-2014';

#  All rights reserved
#
# Description:
#
# Site-Text-Display is a simple perl script used to display text files (typically code) similar to
# the way FireFox does by default. It outputs files with a Content-Type of 'text/plain' in the
# HTTP header which instructs all browsers to display the selected file as text. The output is utf-8
# encoded, thus displaying MobileSiteOS™ scripts and pages correctly. Note: MobileSiteOS™ requires
# all scripts and pages use utf-8 encoding.
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
use lib ('./lib');
use MSOS::Base;
use strict;

$CGI::POST_MAX=1024 * 25;	# max 25K posts
$CGI::DISABLE_UPLOADS = 1;	# no uploads
$CGI::HEADERS_ONCE = 1;		# one set of HTTP headers please

BEGIN { set_message(\&MSOS::Base::handle_errors); }

my %def = ();
my $q = new CGI;

my $display_file = '';
my $display_path = '';

for my $w ($q->param) {
    if ($w =~ m/^display_/) {
        $display_file = $q->param($w);
        $display_path = $w;
    }
}

%def = (

    'script_url' => $q->url
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

binmode(STDOUT, ":utf8");

if ($display_file && $display_path) {

    #  Decode display input string
    # ===========================
    $display_file =~ s/[^A-Za-z0-9_.]//g;   # only allow a-z, 0-9, underscores and periods (this is std. naming convention for all MobileSiteOS files).
    $display_path =~ s/[^A-Za-z0-9_]//g;    # only allow a-z, 0-9 and underscores.
    $display_path =~ s/^display_//;

    # Only allow javascirpt, css, html, json or text files to be viewed
    if ($display_file =~ m/\.js|\.css|\.html|\.json|\.txt$/) {

        $display_path =~ s/[_]/\//g;
        $display_path = $def{'site_base_dir'} . '/' . $display_path;

        if (-d $display_path) {
            # dir exists
            $display_file = $display_path . '/' . $display_file;

            if (-e $display_file && -f $display_file) {
                # file exists and is a plain file
                open (SCRIPT, "$display_file") or &MSOS::Base::handle_errors("Open - Failed! Can't display file:<br />$display_file", 'yes');

                print $q->header(

                    -type		=> 'text/plain; charset=utf-8',
                    -expires	=> 'now',
                    -last_modified	=> scalar(gmtime)
                );

                while ( <SCRIPT> ) { print; }
                close SCRIPT;

            } else {
                &MSOS::Base::handle_errors("File doesn't exist or isn't a plain text file:<br />$display_file", 'yes');
            }
        } else {
            &MSOS::Base::handle_errors("Direcrtory doesn't exist:<br />$display_path", 'yes');
        }

	} elsif ($display_path eq 'cgi' && $def{'redirect_cgi'}->{$display_file}) {

		# Only allow those we have previously set available
		$display_file = './' . $def{'redirect_cgi'}->{$display_file} . &MSOS::Base::check_ext();

        if (-e $display_file && -f $display_file) {
            # file exists and is a plain file
            open (SCRIPT, "$display_file") or &MSOS::Base::handle_errors("Open - Failed! Can't display script:<br />$display_file", 'yes');

            print $q->header(

                -type		=> 'text/plain; charset=utf-8',
                -expires	=> 'now',
                -last_modified	=> scalar(gmtime)
            );

            while ( <SCRIPT> ) { print; }
            close SCRIPT;

        } else {
            &MSOS::Base::handle_errors("Script doesn't exist or isn't a plain text file:<br />$display_file", 'yes');
        }

    } else {
        &MSOS::Base::handle_errors("Script " . $display_file . " is not available for text display!", 'yes');
    }

} else {
	&MSOS::Base::handle_errors("Script requires file and path specification input!", 'yes');
}


#  End of Script
# =========================================================

