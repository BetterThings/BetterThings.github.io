#!/usr/bin/perl
use utf8;
use open ':utf8';
use Encode 'decode_utf8';
use warnings;
#
# Copyright Notice:
my $script_name = 'Site-Media';
my $script_vers = '13.4.6';
my $script_date = 'Apr. 6, 2013';
my $script_year = '2013';

#  Copyright© - OpenSiteMobile
my $copyright_year = '2008-2013';

#  All rights reserved
#
# Description:
#
# Site-Media is a simple perl script used to resize images for display in responsive
# designed web pages.
#
# Contact Information:
#
# Author: Dwight Vietzke Jr.
# Email:  dwight_vietzke@yahoo.com
#

# ==========================================================================
#     Beginning of script...
# ==========================================================================

use diagnostics;
use CGI::Carp qw(fatalsToBrowser set_message);
use CGI qw(:cgi);
use lib ('./lib');
use File::Basename;
use File::Path qw(remove_tree);
use Image::Imlib2;
use Image::Imlib2::Thumbnail;
use JSON;
use MSOS::Base;
use strict;

$CGI::POST_MAX        = 1024 * 25;    # max 25K posts
$CGI::DISABLE_UPLOADS = 1;            # no uploads
$CGI::HEADERS_ONCE    = 1;            # one set of HTTP headers please

BEGIN { set_message(\&MSOS::Base::handle_errors); }

my %def = ();
my $q   = new CGI;

%def = (

   'script_url'    => $q->url,

    # Set 'site_appl_rel_path' via input parameter (specific for each application)
    'site_appl_rel_path' => '',

    # Sized images directory (generated from 'site_appl_rel_path' input)
    'sized_image_dir' => '',

    # Sized images file path of each app's JSON image object
    'sized_image_cfg' => '',

    # Sized image JSON to Perl hash from application javascript directory
    'sized_image_json' => '',

    # Sized image perl hash (default -> empty) shown here
    'sized_image_perl' => {
        "fullsize_images" => {},
        "normalized_images" => {},
        "sized_images" => {},
        "image_break_points" => [ "240", "320", "480", "640", "960", "1280", "1920" ],
        "normalized_dir" => "normalized"
    },

    # List of full size images to be sized
    'sized_image_files' => undef,

    'image_extension' => [
        '.bmp', '.gif', '.jpg', '.jpeg', '.pcx',  '.png',
        '.psd', '.svg', '.tga', '.tif',  '.tiff', '.wbmp',
        '.xbm', '.xcf', '.xpm'
    ],

    'media_txt' => {

        'message2'    => 'Click Update to Run Site-Media',
        'message3'    => 'CGI Environment Variables',
        'message4'    => 'not defined',
        'message5'    => 'Perl Information',
        'message6'    => 'Perl Exe',
        'message7'    => 'Perl Version',
        'message8'    => 'CGI.pm Version',
        'message9'    => 'Carp.pm Version',
        'messagec'    => 'Installation Output',
        'get_image1'  => 'Problem loading image info for: ',
        'build_img0'  => 'Error creating symlink:',
		'build_img1'  => 'New base image found:',
		'build_img2'  => 'Image updated:',
		'build_img3'  => 'Image created:',
		'build_img4'  => 'Detected removed image(s)!',
		'build_img5'  => 'No additions or updates to image files!',
		'build_img6'  => 'Removed image',
        'build_img7'  => 'Removed directory and sub files'
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

# -- Site Media application input
$def{'site_appl_rel_path'} = $q->param('application_rel_path') || '';

# -- Did the require application path info get passed in?
if ($def{'site_appl_rel_path'}) {

    # Define the 'sized' image directory
    $def{'sized_image_dir'} = $def{'site_base_dir'} . $def{'site_appl_rel_path'} . $def{'appl_img_sized'};

    # Define the 'sized' image file url (the application's sized image JSON file)
    $def{'sized_image_cfg'} = $def{'site_base_dir'} . $def{'site_appl_rel_path'} . $def{'appl_js_folder'} . '/' . $def{'appl_config_img_json'};

} else {

    &MSOS::Base::handle_errors(
        "Missing application directory and url input. Please run ?page=console " .
        "from your MobileSiteOS CGI script and then use the Site-Media link.",
        'yes'
    );
}

# -- Get mobile image generation information
if ( $q->param('run_img') eq 'sizing' ) {

    # Define the 'sized' image hash, based on the applications sized image JSON file 
    $def{'sized_image_json'}  = &get_sized_images_json( $q, \%def );
    $def{'sized_image_files'} = &get_available_images( $q, \%def, $def{'sized_image_dir'} ) || undef;
}

# -- Debugging and tests
if ($def{'debug'}) {
	&MSOS::Base::run_debugging( $q, \%def );
}

# -- Run mobile image generation subroutine for each image in 'sized' folder
if ( $q->param('run_img') eq 'sizing' ) {
    &build_images( $q, \%def );     # We run this here so debugging above can show input before it is used!
}


#  Script Output Section
# ===========================

binmode( STDOUT, ":utf8" );

print $q->header(

    -type          => $def{'content_type'},
    -expires       => 'now',
    -last_modified => scalar(gmtime)
);

# -- Run mobile image generation subroutine
if ( $q->param('run_img') eq 'sizing' ) { print $def{'results_list'} }
else                                    { print &print_body( $q, \%def ); }


#  End of Script
# =========================================================



#  SUBROUTINES
# =========================================================

sub print_body {
# -----------------------------

    my $r    = shift;
    my $dref = shift;

    my $key = '';
    my $output = '';

    $output  = "<article>\n\t<section>\n<h2>$dref->{'script_info'}->{'name'} v$dref->{'script_info'}->{'version'}</h2>\n";

    $output .= "<h3>$dref->{'media_txt'}->{'message2'}</h3>\n";
    $output .= "<table class='table table-bordered table-striped table-wordbreak'>\n";
    $output .= "<tr><th colspan='3'>$dref->{'media_txt'}->{'message3'}</th></tr>\n";
    foreach $key ( sort keys %ENV ) {

        my $value = '';

        $value = $ENV{$key} || $dref->{'media_txt'}->{'message4'};
        $value =~ s/;/; /g;
        $value =~ s/&/ &/g;
        $key   =~ s/_/ /g;

        $value = $r->escapeHTML($value);
        $output .= "<tr><td>$key</td><td colspan='2'>$value</td></tr>\n";

    }
    $output .= "</table>";

    $output .= "<table class='table table-bordered table-striped table-wordbreak'>\n";
    $output .= "<tr><th colspan='3'>$dref->{'media_txt'}->{'message5'}</th></tr>\n";
    $output .= "<tr><td>$dref->{'media_txt'}->{'message6'}</td><td colspan='2'>$^X</td></tr>\n";
    $output .= "<tr><td>$dref->{'media_txt'}->{'message7'}</td><td colspan='2'>$]</td></tr>\n";
    $output .= "<tr><td>$dref->{'media_txt'}->{'message8'}</td><td colspan='2'>$CGI::VERSION</td></tr>\n";
    $output .= "<tr><td>$dref->{'media_txt'}->{'message9'}</td><td colspan='2'>$CGI::Carp::VERSION</td></tr>\n";
    $output .= "</table>\t</section>\n</article>\n";

    return $output;
}

sub get_sized_images_json {
# -----------------------------

    my $r       = shift;
    my $dref    = shift;

    my $json_file = $dref->{'sized_image_cfg'};
    my $appl_img_json;
    my $json_text = '';

	unless ( -e $json_file ) {

        # If the file doesn't exist, just use (default -> empty) $dref->{'sized_image_perl'}
        $appl_img_json = $dref->{'sized_image_perl'};

    } else {

         # Otherwise, get the existing file and convert it to perl
        unless ( -r $json_file )   {
            &MSOS::Base::handle_errors( "get_sized_images_json - Unable to read JSON file. Read permissions are not granted!<br />$!", 'yes');
        }

        {
            local $/; #enable slurp
            open my $fh, "<", $json_file or
                &MSOS::Base::handle_errors( "get_sized_images_json - Unable to open/read JSON file!<br />$!", 'yes');
            $json_text = <$fh>;
        }

        $appl_img_json = decode_json($json_text) || '';

        unless ($appl_img_json) {
            &MSOS::Base::handle_errors( "get_sized_images_json - No JSON image file information found!", 'yes');
        }
    }

    return $appl_img_json;
}

sub get_available_images {
# -----------------------------

    my $r           = shift;
    my $dref        = shift;
    my $file_dir    = shift;
    my @all_files   = ();
    my @out_images  = ();
    my @suffixes    = @{ $dref->{'image_extension'} };

    opendir( USER_DIR, $file_dir )
      or &MSOS::Base::handle_errors(
        "$dref->{'media_txt'}->{'get_image1'}<br />$file_dir<br />$!",
        'yes'
      );

    @all_files = readdir(USER_DIR);
    closedir(USER_DIR);

    foreach (@all_files) {

        my $name   = '';
        my $path   = '';
        my $suffix = '';

        if ( $_ =~ m/^\./ )    { next; }
        if ( $_ =~ m/^index/ ) { next; }

        ( $name, $path, $suffix ) = fileparse( $_, @suffixes );

        $name =~ s/\W/_/g;

        if ($suffix) { push @out_images, [ $_, $name ]; }
    }

    return \@out_images;
}

sub build_images {
# -----------------------------

    my $r    = shift;
    my $dref = shift;

    my $flag_new    = 0;
    my $flag_remove = 0;
    my $flag_failed = 0;

    my $appl_url    = $dref->{'site_base_url'} . $dref->{'site_appl_rel_path'};

    my $sized_dir   = $dref->{'sized_image_dir'};
    my $json_cfg    = $dref->{'sized_image_json'};      # Recorded created image files via config_image.json
    my $image_files = $dref->{'sized_image_files'};     # Directory lookup of current images in 'sized' folder
    my $normal_dir  = $sized_dir . '/' . $json_cfg->{'normalized_dir'};

    my $responsive_json_sized  = $json_cfg->{'sized_images'};
    my $responsive_json_normal = $json_cfg->{'normalized_images'};
    my $responsive_json_fullsz = $json_cfg->{'fullsize_images'};

    my %responsive_images = ();
    my %responsive_normal = ();
    my %responsive_fullsz = ();

    my @debug_array = ();

    my $json_text = '';

    # Check for new images
    foreach my $img_file (@$image_files) {
        my $name = "$img_file->[1]";

        unless ($responsive_json_fullsz->{$name}) {
            $dref->{'results_list'} .= "<h3>$dref->{'media_txt'}->{'build_img1'} $name</h3>\n";
            $flag_new = 1;
        }
    }

    # Check to see if image(s) were removed from main 'sized' folder
    if (keys %$responsive_json_fullsz > (scalar @$image_files)) {
        $dref->{'results_list'} .= "<h3>$dref->{'media_txt'}->{'build_img4'}</h3>\n";
        $flag_new = 1;
        $flag_remove = 1;
    }

    # Found a new image in, or an imaged removed from, the 'sized' folder
    if ($flag_new) {

        foreach my $bp ( @{$json_cfg->{'image_break_points'}} ) {

            my %image_name_hash = ();
            my $output_dir = $sized_dir . '/' . $bp;

            push(@debug_array, $output_dir);

            # Create sized image folders, if not already done
            unless ( -d $output_dir ) {
                mkdir( $output_dir, 0777 );
                &MSOS::Base::set_permissions(
                    0777,
                    $output_dir,
                    'Unable to chmod/set mask for: ' . $output_dir
                );
            }

            foreach my $file (@$image_files) {

                my $org_img = $sized_dir  . '/' . $file->[0];
                my $out_img = $output_dir . '/' . $file->[1] . '.jpg';
                my $out_type = '';
                my $new_w    = 0;
                my $new_h    = 0;
                my $fullsize = 'no';

                unless ( -e $org_img )   {
                    &MSOS::Base::handle_errors( "build_images - Unable to open image file. The file does not exist!<br />$!<br />$org_img", 'yes');
                }

                my $source      = Image::Imlib2->load($org_img);
                my $destination = undef;
                my $width       = $source->width;
                my $height      = $source->height;
				my $filesize	= 0;
                my $sym_source  = '';

				$source->image_set_format("jpeg");		# Save new image as .jpg

                if ( $width == $height )    { $out_type = 'square'; }
                else                        { $out_type = $width > $height ? 'landscape' : 'portrait'; }

                # Calc dimensions of reduced images
                ( $new_w, $new_h, $fullsize ) = &calc_img_dimensions( $width, $height, $bp);

                # Is a mobile image available to symlink to (instead of creating another copy)
                if ( $dref->{'use_symlinks'} ) {
                    foreach my $bp_size ( keys %responsive_images ) {
                        my $existing_img = $responsive_images{$bp_size}->{ $file->[1] }
                          || undef;
                        if (   $existing_img
                          && ( $existing_img->[0] == $file->[0] )
                          && ( $existing_img->[1] == $new_w )
                          && ( $existing_img->[2] == $new_h )
                          && ( $existing_img->[3] == $out_type ) )
                        {
                            $sym_source = $sized_dir . '/' . $bp_size . '/' . $file->[1] . '.jpg';
                            last;
                        }
                    }
                }

                # Check to see if the image already exists
                if ( -e $out_img ) {
                    my $check_img = Image::Imlib2->load($out_img);
                    my $check_w   = $check_img->width;
                    my $check_h   = $check_img->height;

                    # Check if image is the same size
                    unless ( ( $check_w == $new_w ) && ( $check_h == $new_h ) ) {
                        # Delete org. image if new is different
                        unlink($out_img);
                        if ($sym_source) {
                            symlink( $sym_source, $out_img )
                                || &MSOS::Base::handle_errors(
                                    "$dref->{'media_txt'}->{'build_img0'}<br />$sym_source<br />$!",
                                    'yes'
                                );
                            $dref->{'results_list'} .= "<p>$dref->{'media_txt'}->{'build_img2'} $file->[1].jpg 'symlink' for $bp</p>\n";
                        } else {
                            $destination = $source->create_scaled_image( $new_w, $new_h );
                            $destination->save($out_img);
                            $dref->{'results_list'} .= "<p>$dref->{'media_txt'}->{'build_img2'} $file->[1].jpg for $bp</p>\n";
                        }
                        $flag_new = 1;
                        # Add some debugging to the page (html comment)
                        $dref->{'results_list'} .= "<!-- \$check_w = $check_w, \$new_w = $new_w, \$check_h = $check_h, \$new_h = $new_h -->\n";
                    }

                # Create the image, since it is new
                } else {
                    if ($sym_source) {
                        symlink( $sym_source, $out_img )
                            || &MSOS::Base::handle_errors(
                                "$dref->{'media_txt'}->{'build_img0'}<br /><br />$sym_source<br /><br />$!",
                                'yes'
                            );

                        $dref->{'results_list'} .= "<p>$dref->{'media_txt'}->{'build_img3'} $file->[1].jpg 'symlink' for $bp</p>\n";
                    } else {
                        $destination = $source->create_scaled_image( $new_w, $new_h );
                        $destination->save($out_img);

                        $dref->{'results_list'} .= "<p>$dref->{'media_txt'}->{'build_img3'} $file->[1].jpg for $bp</p>\n";
                    }
                    $flag_new = 1;
                }

				# Record size images info here (symbolic linked images will have size 0)
				$filesize = -s $out_img;
                $image_name_hash{ $file->[1] } = [ $out_type, $new_w, $new_h, $fullsize, $filesize ];
            }

            # If we removed a file from the 'sized' folder, remove all symlinks and images in sized_images sub folders
            if ($flag_remove) {
                my $display_image_files = &get_available_images( $r, $dref, $output_dir );
                foreach my $file (@$display_image_files) {
                    my $previous_img = $output_dir . '/' . $file->[0];
                    if ( -e $previous_img || -l $previous_img ) {
                        my $sym_text = 'file';
                        unless ( $image_name_hash{ $file->[1] } ) {
                            if ( -l $previous_img ) { $sym_text = 'symlink'; }
                            if (unlink($previous_img)) {
                                $dref->{'results_list'} .= "<p>$dref->{'media_txt'}->{'build_img6'} $sym_text from folder $bp:<br>$previous_img</p>\n";
                            } else {
                                $flag_failed = 1;
                                push(@debug_array, $previous_img . ' unlink failed');
                            }
                        }
                    }
                }
            }

            $responsive_images{$bp} = \%image_name_hash;
        }

        # Debugging
        if ($dref->{'debug'} eq 'break_points') {
            &MSOS::Base::debug_dump($dref, [ \@debug_array, \%responsive_images, \%responsive_normal, \%responsive_fullsz ]);
            &MSOS::Base::handle_errors( "build_images - Break Points Dump: <a href ='$appl_url/debug_dump.txt'>debug_dump.txt</a> file", 'yes');
        }

        # Create normalized image folder, if not already done
        unless ( -d $normal_dir ) {
            mkdir( $normal_dir, 0777 );
            &MSOS::Base::set_permissions(
                0777,
                $normal_dir,
                'Unable to chmod/set mask for: ' . $normal_dir
            );
        }

        foreach my $norm_source (@$image_files) {

            my $norm_org = $sized_dir . '/' . $norm_source->[0];
            my $norm_nme = $norm_source->[1];
            my $norm_odr = $normal_dir . '/' . $norm_nme;  # thumbnail output directory

			my $source_file_size = -s $norm_org;

            my %norm_name_hash = ();

            push(@debug_array, $norm_odr);

            # Create normalized images if directory doesn't exist
            unless ( -d $norm_odr ) {

                mkdir( $norm_odr, 0777 );
                &MSOS::Base::set_permissions(
                    0777,
                    $norm_odr,
                    'Unable to chmod/set mask for: /' . $norm_source->[1]
                );
			}

			# Generate a set of normalized images from the $norm_org source in $norm_odr directory
			my $thumbnail = Image::Imlib2::Thumbnail->new();
			my @thumbnails = $thumbnail->generate( $norm_org, $norm_odr );

			foreach my $thumbnail (@thumbnails) {
				unless ($thumbnail->{name} eq 'original') {
					my $norm_file_size = -s $norm_odr . '/' . $thumbnail->{name} . '.jpg';
					$norm_name_hash{$thumbnail->{'name'}} = [ $thumbnail->{'type'}, $thumbnail->{'width'}, $thumbnail->{'height'}, $norm_file_size ];
					$dref->{'results_list'} .= "<p>$dref->{'media_txt'}->{'build_img3'} $norm_nme as $thumbnail->{'name'}</p>\n";
				} else {
					# Record the original image which was used
					$responsive_fullsz{$norm_nme} = [ $thumbnail->{'type'}, $thumbnail->{'width'}, $thumbnail->{'height'}, $source_file_size ];
				}
			}

			$responsive_normal{$norm_nme} = \%norm_name_hash;
        }

        # Debugging
        if ($dref->{'debug'} eq 'normalized') {
            &MSOS::Base::debug_dump($dref, [ \@debug_array, \%responsive_images, \%responsive_normal, \%responsive_fullsz ]);
            &MSOS::Base::handle_errors( "build_images - Normalized Dump: <a href ='$appl_url/debug_dump.txt'>debug_dump.txt</a> file", 'yes');
        }

        # If we removed a file from the 'sized' folder, remove all images in normalized_images sub folders
        if ($flag_remove) {

            # Check the original JSON file spec's for normalized images
            foreach my $check (keys %$responsive_json_normal) {
                # If it isn't included in the revised spec's, delete all images
                unless ($responsive_fullsz{$check}) {

                    my $check_dir = $normal_dir . '/' . $check;  # previous image output directory

                    push(@debug_array, $check_dir);

                    if (-d $check_dir) {

                        # Remove directory and all images inside
                        remove_tree( $check_dir, { 'safe' => 1, 'error' => \my $err } );

                        if (@$err) {
                            $flag_failed = 1;
                            for my $diag (@$err) {
                                my ($file, $message) = %$diag;

                                if ($file eq '') {
                                    push(@debug_array, $check_dir . ' ' . $message);
                                } else {
                                    push(@debug_array, $check_dir . '/' . $file . $message);
                                }
                            }
                        } else {
                            $dref->{'results_list'} .= "<p>$dref->{'media_txt'}->{'build_img7'}:<br />$check_dir</p>\n";
                        }

                    } else {
                        # Something went wrong, so flag it...
                        $flag_failed = 1;
                    }
                }
            }
        }

        # Debugging
        if ($flag_failed || $dref->{'debug'} eq 'build_images') {
            &MSOS::Base::debug_dump($dref, [ \@debug_array, \%responsive_images, \%responsive_normal, \%responsive_fullsz ]);
            &MSOS::Base::handle_errors( "build_images - Dump: <a href ='$appl_url/debug_dump.txt'>debug_dump.txt</a> file", 'yes');
        }

        $json_cfg->{'sized_images'}         = \%responsive_images;
        $json_cfg->{'normalized_images'}    = \%responsive_normal;
        $json_cfg->{'fullsize_images'}      = \%responsive_fullsz;

        # Encode perl scalar as JSON
        $json_text = encode_json( $json_cfg );

        # Save file
        open(CFG, "> $dref->{'sized_image_cfg'}") ||
            &MSOS::Base::handle_errors(
                "build_images - Unable to open/save JSON file!<br />$!",
                'yes'
            );
        print CFG $json_text;
        close(CFG);

        &MSOS::Base::set_permissions(
            0644,
            $dref->{'sized_image_cfg'},
            'Unable to chmod/set mask'
        );

    } else {
        $dref->{'results_list'} .= "<h2>$dref->{'script_info'}->{'name'} v$dref->{'script_info'}->{'version'}</h2>\n";
        $dref->{'results_list'} .= "<h3>$dref->{'media_txt'}->{'build_img5'}</h3>\n"; 
    }

    $dref->{'results_list'} = "<article>\n\t<section>\n$dref->{'results_list'}\t</section>\n</article>\n";
}

sub calc_img_dimensions {
# -----------------------------

    my $img_w       = shift;
    my $img_h       = shift;
    my $breakpoint  = shift; # device or relative page width, height to maintain

    my $img_aspect = $img_w / $img_h;   # calc width to height ratio

    my $img_out_h = 0;
    my $img_out_w = 0;
    my $is_fullsize = 'no';

    # Image larger than breakpoint (typical)
    if ( $img_w > $breakpoint ) {
        $img_out_w = int( $img_w * ( $breakpoint / $img_w ) );
        $img_out_h = int( $img_out_w / $img_aspect );

    # Image smaller than breakpoint, so use fullsize
    } else {
        $img_out_h = $img_h;
        $img_out_w = $img_w;
        $is_fullsize = 'yes';
    }

    return ( $img_out_w, $img_out_h, $is_fullsize );
}
