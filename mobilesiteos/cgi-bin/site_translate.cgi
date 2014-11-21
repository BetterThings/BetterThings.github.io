#!/usr/bin/perl
use utf8;
use open ':utf8';
use Encode 'decode_utf8';
use warnings;
#
# Copyright Notice:
my $script_name = 'Site-Translate';
my $script_vers = '14.4.16';
my $script_date = 'Apr. 16, 2014';
my $script_year = '2014';

#  Copyright© - OpenSiteMobile
my $copyright_year = '2010-2014';

#  All rights reserved
#
# Description:
#
# Site-Translate is a simple perl script used to produce JSON files on the web server.
# Site-Translate is used in conjunction with our 'msos_translate.html' page to add/edit
# Dojo Toolkit style language files. These language files reside in the 'nls' folder
# of MobileSiteOS™'s '/msos' folder and are used to apply language specific text
# to each MobileSiteOS™ javascript widget type program. 
#
# Special Note:
#
# DO NOT leave this script active on the web server after you are done using it. It provides
# no security measures against others using it to make changes to your work. Remove, disable
# or password protect this script in some way when you are done with it.
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

for my $p ($q->param) {
	my @v = map {Encode::decode('utf8',$_)} $q->param($p);
	$q->param($p,@v);
}

# Google available languages for translation (2/19/2013)
my @avail_langs = (
    "af", "ar", "be", "bg", "ca", "cs", "cy", "da", "de", "el", "en",
    "eo", "es", "et", "fa", "fi", "fr", "ga", "gl", "hi", "hr", "ht",
    "hu", "id", "is", "it", "iw", "ja", "ko", "lt", "lv", "mk", "ms",
    "mt", "nl", "no", "pl", "pt", "ro", "ru", "sk", "sl", "sq", "sr",
    "sv", "sw", "th", "tl", "tr", "uk", "vi", "yi", "zh", "zh-TW"
);

%def = (

    'translate_path' => '',

    # Edit or add languages to translate between using two letter designation
    'translate_lang' => \@avail_langs,

    'script_url' => $q->url,

	'tran_txt' => {

		'message5'	=>  'Perl Information',
		'message6'	=>  'Perl Exe',
		'message7'	=>  'Perl Version',
		'message8'	=>  'CGI.pm Version',

		'script_mes1'	=>  'Script is OK.',
		'script_mes2'	=>  'This script expects input from our translate.html page to function fully.',
	
		'trans_folder'	=>  'Creating dir failed!',
        'trans_failed'  =>  'Writing translation file failed!',
        'trans_success' =>  'Translation file written successfully.',
        'trans_lang_na' =>  'Translation language not recognized.',
        'trans_modu_na' =>  'Translation module name not recognized.',
        'trans_text_na' =>  'Translation text was not valid.'
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


#  Translation write file logic
# ===========================

$def{'translate_path'} = $def{'site_base_dir'} . $def{'msos_nls_folder'};

$def{'results_list'} = $def{'tran_txt'}{'trans_failed'};

$def{'translation_lang'} = $q->param('translate_lang') || '';
$def{'translation_modu'} = $q->param('translate_module') || '';
$def{'translation_text'} = $q->param('json_text') || '';
$def{'translation_set'}  = $q->param('set_new_base') || '';

my $lang_array_ref = $def{'translate_lang'};
my $flag = 0;

foreach my $lang (@$lang_array_ref) {
	$lang =~ s/-/_/;
	$lang = lc($lang);
	if ($lang eq $def{'translation_lang'}) { $flag = 1; last; }
}

if ($flag) {
    if ($def{'translation_modu'} =~ m/^page|calendar|candy|colortool|common|keyboard|multiselect|player|popdiv|timeago$/) {
        if (($def{'translation_text'} =~ m/^[{].+/) && ($def{'translation_text'} =~ m/[}]$/)) {
            &write_json_file(\%def);
        } else  { $def{'results_list'} .= '<br />' . $def{'tran_txt'}{'trans_text_na'}; }
    } else      { $def{'results_list'} .= '<br />' . $def{'tran_txt'}{'trans_modu_na'}; }
} else          { $def{'results_list'} .= '<br />' . $def{'tran_txt'}{'trans_lang_na'}; }


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

if ($def{'translation_modu'}
 && $def{'translation_lang'}
 && $def{'translation_text'})	{    &print_body($q, \%def); }
else							{ &print_default($q, \%def); }


#  End of Script
# =========================================================



#  SUBROUTINES
# =========================================================

sub print_body {
# -----------------------------

	my $r = shift;
	my $dref = shift;

	print "\t<section>\n<h2>$dref->{'script_info'}->{'name'} v$dref->{'script_info'}->{'version'}</h2>\n";
	print "<h2>$dref->{'results_list'}</h2>\n";

	if ($r->param('translate_module'))      { print "<h3>Module: "  . $r->param('translate_module') . ".js</h3>\n"; }
	if ($r->param('translate_from'))        { print "<h3>From: "    . $r->param('translate_from')   . "</h3>\n";    }
	if ($r->param('translate_to'))          { print "<h3>To: "      . $r->param('translate_to')     . "</h3>\n";    }

	print "<table class='table table-bordered table-striped table-wordbreak'>\n";
	print "<tr><th colspan='3'>$dref->{'tran_txt'}->{'message5'}</th></tr>\n";
	print "<tr><td>$dref->{'tran_txt'}->{'message6'}</td><td colspan='2'>$^X</td></tr>\n";
	print "<tr><td>$dref->{'tran_txt'}->{'message7'}</td><td colspan='2'>$]</td></tr>\n";
	print "<tr><td>$dref->{'tran_txt'}->{'message8'}</td><td colspan='2'>$CGI::VERSION</td></tr>\n";
	print "</table>\t</section>\n";
}

sub print_default {
# -----------------------------

	my $r = shift;
	my $dref = shift;

	print "\t<section>\n<h2>$dref->{'script_info'}->{'name'} v$dref->{'script_info'}->{'version'}</h2>\n";

	print "\t\t<h3>$dref->{'tran_txt'}->{'script_mes1'}</h3>\n";
	print "\t\t<div id='status'><span class='alert'>$dref->{'tran_txt'}->{'script_mes2'}</span></div>\n";
	print "\t</section>\n";
}

sub write_json_file {
# -----------------------------

	my $dref = shift;
	my $fh = &MSOS::Base::gen_filehandle();
	my $folder = '';
	my $path = '';

	my $lang_code = lc($dref->{'translation_lang'});

	$lang_code =~ s/_/-/g;

	$folder = $dref->{'translate_path'} . '/' . $lang_code;
	$path	= $folder . '/' . $dref->{'translation_modu'} . '.json';

	$dref->{'results_list'}  = $dref->{'tran_txt'}->{'trans_success'} . "<br />\n";
	$dref->{'results_list'} .= '<br />' . $lang_code . '/' . $dref->{'translation_modu'} . ".json\n";

	unless(-d $folder) {
		mkdir($folder, 0755) or &MSOS::Base::handle_errors( "Write JSON File - " . $dref->{'tran_txt'}->{'trans_folder'} . "<br />$folder<br />$!", 'yes' );
	}

	# Clean up our output text
	$dref->{'translation_text'} = &clean_text($dref->{'translation_text'});

	&MSOS::Base::open_write_file(
        $fh,
        $path,
        'write_json_file -> ' . $dref->{'tran_txt'}->{'trans_failed'},
        $dref->{'translation_text'}
	);

	# Special case for rewriting the 'base' nls file
	if ($def{'translation_set'}) {

		$path = $dref->{'translate_path'} . '/' . $dref->{'translation_modu'} . '.json';
		$dref->{'results_list'} .=   '<br />' . $dref->{'translation_modu'} . ".json\n";

		&MSOS::Base::open_write_file(
			$fh,
			$path,
			'write_json_file -> set new base: ' . $dref->{'tran_txt'}->{'trans_failed'},
			$dref->{'translation_text'}
		);
	}
}

sub clean_text {
# -----------------------------

    my $text = shift;

    $text =~ s/\n/ /g;
    $text =~ s/\r/ /g;
	$text =~ s/\s+/ /g;

    return $text;
}