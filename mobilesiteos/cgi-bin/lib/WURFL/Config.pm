package WURFL::Config;
#
# Copyright Notice:
#
#                       Config.pm
#              Copyright©2009-2013 - OpenSiteMobile
#                    All rights reserved
#
# Description:
#
# Subroutines and variables used to configure our Perl access to WURFL data and also to
# shrink the size of that data. Both the perl_wurfl.cgi script (to creating the data) and
# site_wurfl.cgi (to use the data) must use the same reduction encoding (&user_agent). Otherwise,
# things won't 'match' correctly to predict device capabilities.
#
# Use of this script:
#
# Selling the code for this script without prior written consent is expressly
# forbidden. You must obtain written permission before redistributing this
# script for profit over the Internet or in any other medium. In any and all
# cases, copyright and header information must remain intact.
#
# Contact Information:
#
# Author: Dwight Vietzke Jr.
# Email:  dwight_vietzke@yahoo.com
#


# Our configuration variables...
$config_vars = {

    db_descriptor => "DBI:mysql:database=wurfl:host=localhost", 
    db_username => 'root',
    db_password => 'vito4659',

    wurfl_action => 'continue',
    wurfl_path => './lib/WURFL/',
    wurfl_status => '',
    # Set this to your WURFL customer specific download valt url
    wurfl_url => 'http://sourceforge.net/projects/wurfl/files/WURFL/2.3.5/wurfl-2.3.5.xml.gz/download',
    # Stats for file at wurfl_file
    wurfl_local => [0, 0],
    # Stats for file at wurfl_url
    wurfl_remote => [0, 0],
    # WURFL groups to include in output database (add or subtract as you need access to values)
    wurfl_groups => [
        'product_info', 'wml_ui', 'chtml_ui', 'xhtml_ui', 'html_ui', 'css', 'ajax', 'markup',
        'cache', 'display', 'image_format', 'bugs', 'wta', 'security', 'bearer', 'storage',
        'object_download', 'playback', 'wap_push', 'drm', 'streaming', 'mms', 'j2me', 'sms',
        'sound_format', 'flash_lite', 'transcoding', 'rss', 'pdf', 'chips', 'smarttv'
    ],
    # Sets 'Data::Dumper' indentation level, (0 is none)
    wurfl_dump_indent => 1,
    wurfl_tables => {},

    device_table_name => 'device',
    capability_table_name => 'capability',

    user_agent_vc_length => 100,
    group_vc_length => 20,
    name_vc_length => 50,
    value_vc_length => 120,

    # Set to 1 for logging to 'wurfl.log' in './lib/WURFL/' folder
    verbose => 0
};

# Define Perl-WURFL-MySQL tables and fields
$config_vars->{'wurfl_tables'}->{$config_vars->{'device_table_name'}}	  =  [ 'user_agent', 'fall_back' ];
$config_vars->{'wurfl_tables'}->{$config_vars->{'capability_table_name'}} =  [ 'user_agent', 'group_cap', 'name', 'value' ];


# Sub to encode common long string segments in user agents
sub user_agent {

    # Note:	This works because we use this subroutine on all
    #		incoming user agent strings, before device prediction

    # Input a user agent string
    my $ua = shift;
    
    # Remove non word characters (they don't add an information)
    $ua =~ s/_//g;
    $ua =~ s/\W+//g;

    # Make everything lowercase
    # (since MySQL, others? consider upper and lower case character matches the same)
    $ua = lc ($ua);

    # Encode many common long strings - Order is important!
    # This is vital since text comparing algorithyms used later are cpu/memory intensive
    # (yes this is tedious, but saves'lots' of db space and is easy to append new regex's to)
    $ua =~ s/^3gsonyericsson/3gse_/;
    $ua =~ s/^sonyericsson/snye_/;
    $ua =~ s/^acsnf30ne/ac31_/;
    $ua =~ s/^acer_iconia/aci_/;
    $ua =~ s/^acer_liquid/acl_/;
    $ua =~ s/^alcatel_ot/alot_/;
    $ua =~ s/^alcatel_th/alth_/;
    $ua =~ s/^amazon_kindle/amkn_/;
    $ua =~ s/^android/and_/;
    $ua =~ s/^apple_ipad/apla_/;
    $ua =~ s/^apple_ipod_touch/aplot_/;
    $ua =~ s/^apple_ipod/aplo_/;
    $ua =~ s/^apple_iphone/aplh_/;
    $ua =~ s/^audiovox_cdm/audxc_/;
    $ua =~ s/^audiovox/audx_/;
    $ua =~ s/^alcatel/alcl_/;
    $ua =~ s/^blackberry/blck_/;
    $ua =~ s/^browser_blackberry/brblck_/;
    $ua =~ s/^browser_blazer/brblz_/;
    $ua =~ s/^browser_gecko_fennec/brgekf_/;
    $ua =~ s/^browser_netfront/brnet_/;
    $ua =~ s/^browser_nokia_series/brn_/;
    $ua =~ s/^browser_openwave/brow_/;
    $ua =~ s/^browser_opera/brop_/;
    $ua =~ s/^browser_opera_mini/bropm_/;
    $ua =~ s/^browser_pie/brp_/;
    $ua =~ s/^browser_root/brr_/;
    $ua =~ s/^browser_sonyericsson/brsy_/;
    $ua =~ s/^browser_ucweb/bruc_/;
    $ua =~ s/^browser_uzard/bruz_/;
    $ua =~ s/^browser_webkit_android/brweba_/;
    $ua =~ s/^browser_webkit_dolfin_jasmine/brwebdj_/;
    $ua =~ s/^browser_webkit_iphoneos/brwebi_/;
    $ua =~ s/^browser_webkit_nokia_series/brwebn_/;
    $ua =~ s/^browser_webkit_steel/brwebs_/;
    $ua =~ s/^browser_winwap/brwap_/;
    $ua =~ s/^ccwap_browser_ver1/ccwap1_/;
    $ua =~ s/^compal/cpl_/;
    $ua =~ s/^danger_hiptop_ver/dght_/;
    $ua =~ s/^docomo_generic/dcmg_/;
    $ua =~ s/^docomo/dcm_/;
    $ua =~ s/^donotmatch/dnm_/;
    $ua =~ s/^ericsson/eric_/;
    $ua =~ s/^fake/fk_/;
    $ua =~ s/^generic_android/gnan_/;
    $ua =~ s/^generic_dolfin/gndl_/;
    $ua =~ s/^generic_lguplus/gnlg_/;
    $ua =~ s/^generic_maui_wap_browser_ver1/gnmau_/;
    $ua =~ s/^generic_ms_mobile_browser_ver1/gnmsm_/;
    $ua =~ s/^generic_netfront_ver/gnnet_/;
    $ua =~ s/^generic_opera_mini/gnopm_/;
    $ua =~ s/^generic_sonyericsson_netfront_ver/gnsyenet_/;
    $ua =~ s/^generic_winmo_opera/gnwinmop_/;
    $ua =~ s/^google_nexusone_ver/ggnx_/;
    $ua =~ s/^goodaccess/gas_/;
    $ua =~ s/^gradiente/gdt_/;
    $ua =~ s/^hpipaq/hp_/;
    $ua =~ s/^htc_touch_cruise/htctcr_/;
    $ua =~ s/^htc_touch_ver/htcv_/;
    $ua =~ s/^htc_touch/htct_/;
    $ua =~ s/^htc_tytn_ver/htcty_/;
    $ua =~ s/^htctouch/htct_/;
    $ua =~ s/^httpwwwvoxtelruuaprofvoxte/httpvox_/;
    $ua =~ s/^jataayu/jyu_/;
    $ua =~ s/^jbrowser/jbr_/;
    $ua =~ s/^jphone/jph_/;
    $ua =~ s/^lenovo/len_/;
    $ua =~ s/^meridian/mdn_/;
    $ua =~ s/^mobileexplorer_ver/mobex_/;
    $ua =~ s/^motorola/mot_/;
    $ua =~ s/^moz50ipoducpulikemacos/mzmac_/;
    $ua =~ s/^moz50iphoneucpuiphoneos/mziph_/;
    $ua =~ s/^moz50ipoducpuiphoneos/mzipo_/;
    $ua =~ s/^mozilla/moz/;
    $ua =~ s/^ms_mobile_browser_ver/msmob_/;
    $ua =~ s/^nokia/nk_/;
    $ua =~ s/^nokia_generic_series/nkgn_/;
    $ua =~ s/^netfront_ver/netf_/;
    $ua =~ s/^opera_nokia/opnk_/;
    $ua =~ s/^opera_sonyericsson/opsye_/;
    $ua =~ s/^opera/op_/;
    $ua =~ s/^optimayseville/opsv_/;
    $ua =~ s/^orange/org_/;
    $ua =~ s/^panasonic/pana_/;
    $ua =~ s/^philips/php_/;
    $ua =~ s/^portalmmm/pmmm_/;
    $ua =~ s/^rover/rv_/;
    $ua =~ s/^samsung/sams_/;
    $ua =~ s/^softbank/sft_/;
    $ua =~ s/^telitmobileterminals/tmt_/;
    $ua =~ s/^uabait_opera_mini/ubopm_/;
    $ua =~ s/^vodafone/voda_/;
    $ua =~ s/^wapalizer/wplz_/;
    $ua =~ s/^yourwap/ywp_/;
    $ua =~ s/android/_and/;
    $ua =~ s/applewebkit/_awk/g;
    $ua =~ s/asyncmlhwsyncml/_asycml/g;
    $ua =~ s/ammsobigommsq/_amsq/g;
    $ua =~ s/blackberry/_bby/g;
    $ua =~ s/cellphone/_cel/g;
    $ua =~ s/ceppc240x320/_cepp/g;
    $ua =~ s/configuration/_cf/g;
    $ua =~ s/compatible/_cp/g;
    $ua =~ s/browser/_b/g;
    $ua =~ s/ceiemobile/_ceie/g;
    $ua =~ s/expressmusic_ver/_expm/g;
    $ua =~ s/forhutchison/_fhut/g;
    $ua =~ s/htcmagicbuildcr/_htcm/;
    $ua =~ s/internet/_i/g;
    $ua =~ s/iphoneucpulikemacos/_iphos/;
    $ua =~ s/javahwja/_jah/g;
    $ua =~ s/khtmllikegecko/_khtml/g;
    $ua =~ s/linux/_l/g;
    $ua =~ s/macosxenus/_macos/;
    $ua =~ s/mobilephone/_mph/g;
    $ua =~ s/mobile/_m/g;
    $ua =~ s/microsoft/_ms/g;
    $ua =~ s/motorola/_mt/g;
    $ua =~ s/mozilla/_mz/g;
    $ua =~ s/navigator/_nav/g;
    $ua =~ s/nokia/_nk/g;
    $ua =~ s/opera/_op/g;
    $ua =~ s/operamini/_opmi/g;
    $ua =~ s/palmsource/_pls/g;
    $ua =~ s/pdapalmossonymodel/_plmsny/g;
    $ua =~ s/phonesimulator/_psim/g;
    $ua =~ s/profile/_p/g;
    $ua =~ s/safari/_saf/g;
    $ua =~ s/samsung/_smg/g;
    $ua =~ s/series/_se/g;
    $ua =~ s/smartphone/_sp/g;
    $ua =~ s/sonyericsson/_snye/g;
    $ua =~ s/symbianos/_sy/g;
    $ua =~ s/toolkit/_tk/g;
    $ua =~ s/touch_ver/_tchv/g;
    $ua =~ s/toshiba/_tosh/g;
    $ua =~ s/vendor/_ve/g;
    $ua =~ s/version/_vr/g;
    $ua =~ s/vodafone/_voda/g;
    $ua =~ s/windows/_w/g;

    # Force string data for user agents (since we use them as hash keys later)

    # Stop 'numeric only' returned user agent values
    unless ($ua =~ m/[a-z]/i) { $ua = 'nu_' . $ua; }

    # Stop 'numeric only' in what might become the base unique user agent
    my $fr =  substr $ua, 0, 6;
    unless ($fr =~ m/[a-z]/i) { $ua = 'nu_' . $ua; }

    return $ua;
}


1;
