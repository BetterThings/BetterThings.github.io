#!/usr/bin/perl
use utf8;
use open ':utf8';
use Encode 'decode_utf8';
use warnings;

# Copyright Notice:
my $script_name = 'Perl-WURFL';
my $script_vers = '13.4.6';
my $script_date = 'Apr. 6, 2013';
my $script_year = '2013';

#  Copyright© - OpenSiteMobile
my $copyright_year = '2008-2013';
#  All rights reserved
#
# License Agreement:
#
# This script is free software distributed under the GNU GPL version 2 or higher, 
# GNU LGPL version 2.1 or higher and Apache Software License 2.0 or higher. This means
# you may choose one of the three and use it as you like. In case you want to review
# these licenses, you may find them online in various formats at http://www.gnu.org and
# http://www.apache.org.
#
#   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY 
#   KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE 
#   WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE 
#   AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR 
#   COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
#   LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR 
#   OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE 
#   SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
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


# ==========================================================================
#     Beginning of script...
# ==========================================================================

use CGI::Carp qw(fatalsToBrowser set_message);
use CGI qw(:cgi);
use lib ( './lib');
use WURFL::Setup;
use WURFL::Config;
use WURFL::WURFLLite;
use Data::Dumper;
use String::Diff;
use strict;

$CGI::POST_MAX=1024 * 25;	# max 25K posts
$CGI::DISABLE_UPLOADS = 1;	# no uploads
$CGI::HEADERS_ONCE = 1;		# one set of HTTP headers please

my $q = new CGI;

my $program_step =   $q->param('step')   || '';
my $program_action = $q->param('action') || '';


# Generate a new 'wurfl' object
# Note: see WURFL::Config for configuration settings
my $wurfl_setup = WURFL::Setup::new_wurfl($WURFL::Config::config_vars);

# Set 'Data::Dumper' to 'minimum' indention
# (1 or more) for presentation in web page output.
# We set ua_atts.pm and ua_caps.pm output indention in WURFL/Config.pm
$Data::Dumper::Indent = 1;


# Setup some basic function subroutines
# -----------------------------

# Define the permissions setting
# subroutine to be used for new file/dir's
my $set_perm = sub {

  my $perm = shift;
  my $path = shift;
  my $warn = shift;

  chmod $perm, $path	or warn "$warn $perm - $path - $!";
};

 
# Start of script logic (default page -> 'else' below):
# -----------------------------

if ($program_step eq '1') {

    # =======================
    # Step 1:
    # =======================

    my %result = ();
    my @devices = ();
    my @devices_sort = ();
    my @obsolete = ();
    my @obsolete_sort = ();

    # List of capabilities we wish to include in our perl data...
    my $array_ref = $wurfl_setup->{wurfl_groups};
    my @select_capability = @$array_ref;

    my $fh_tmpl = &gen_filehandle();
    my $wurfl_error = 'Openning WURFL XML file - Unable to open/read file for ' . $wurfl_setup->{wurfl_file} . '!';

    # -- Open the file within the scope: open ':utf8' (note 'use open' above)
 
    my $wurfl_xml = &open_file(
        $fh_tmpl,
        $wurfl_setup->{wurfl_file},
        $wurfl_error,
    );

    # Get WURFL converted to a perl hash (WURFLLite.pm)
    &parseXML(\%result, $wurfl_xml);

    # Lets get all the device names
    foreach my $device_name (keys %{$result{'devices'}}) { push @devices, $device_name; }

    # Sort our just created lists
    @devices_sort =  sort @devices;

    # Create attributes and capabilities hashs

    my %attributes_hash = ();
    my %capabilities_hash = ();

    foreach my $dev (@devices) {

	# Skip fake device stuff
        if ($dev =~ m/^fake_/) {
	    # Uncomment the next line to see skipped 'fake_' devices
	    #warn "Skipped device: " . $dev;
	    next;
	}

        $attributes_hash{$dev} = $result{'devices'}->{$dev}->{'attributes'};

        # Process our capabilities hash
        my %temp_caps_hash = ();

        # Filter out the capabilities we want to have access to!
        foreach my $caps (@select_capability) {

            my $temp_caps_ref = $result{'devices'}->{$dev}->{'capabilities'}->{$caps} || undef;
 
            # Filter out 'undefined' values and empty hashes (they just take up space in perl text output)
            if (defined $temp_caps_ref) {
                my $hash_keys = keys %$temp_caps_ref;
                if ($hash_keys > 0) {
                    $temp_caps_hash{$caps} = $temp_caps_ref;
                }
            } else {
		# Uncomment the line below to see the redundancy left without above filter
		#warn "Skipped device: " . $dev . " capability: " . $caps . " because undef";
	      }
        }

        # Skip 'capabilities' hash if empty (ie: no selected properties of interest)
        if (keys %temp_caps_hash > 0) {
            $capabilities_hash{$dev} = \%temp_caps_hash;
        }
    }

    # Convert '%attribute_hash' to perl encoded text
    my $attribute_text = Data::Dumper->Dump([\%attributes_hash], [qw(device_attributes)]);

    # Now, lets make a package of it
    &create_package('dev_attributes', $result{'versions'}->{'ver'}, $attribute_text, $wurfl_setup->{wurfl_path});

    # Convert '%capabilities_hash' to perl encoded text
    my $capabilities_text = Data::Dumper->Dump([\%capabilities_hash], [qw(device_capabilities)]);

    # Now, lets make a package of it
    &create_package('dev_capabilities', $result{'versions'}->{'ver'}, $capabilities_text, $wurfl_setup->{wurfl_path});


    binmode(STDOUT, ":utf8");

    print "Content-type: text/html; charset=utf-8\n\n";
    print "<html><body>\n";
    print "<br />\n<h1 style='text-align:center;'>WURFL Device Data to PERL Data: Step 1</h1>\n";
    print "<h2 style='text-align:center;'><a href='" . $q->url . "?step=2'>Run Step 2 | Encode and Filter Data</a></h2>\n";
    print "<p>Completed!<br /></p>\n\n";
    print "<pre >\n";

    print "WURFL version: $result{'versions'}->{'ver'}\n\n";
    print "WURFL XML Data file converted to Temp. PERL Data:\n\tDevice Attributes - WURFL::dev_attributes.pm and\n\tDevice Capabilities - WURFL::dev_capabilities.pm\n";

    print "\nNumber of included devices: " . (keys %attributes_hash) . "\n\n";
    print "Standard WURFL device name (per WURFL XML data):\n\n";

    my $temp_string1 = join("\n", @devices_sort);
    print $temp_string1;

    print "\n\n</pre></body></html>\n";

} elsif ($program_step eq '2') {

    # =======================
    # Step 2:
    # =======================

    require $wurfl_setup->{wurfl_path} . 'dev_attributes.pm';
    require $wurfl_setup->{wurfl_path} . 'dev_capabilities.pm';

    my %attributes_hash = ();
    my %user_agent_hash = ();
    my %duplicates_hash = ();
    my @dup_sort = ();
    my $print_output = "Failed!<br />\n<br />\nThe script failed to reduce the dev_attributes.pm file size.";
    my $dup_string = "WURFL Device Name (per WURFL XML data):\n\tUser Agent String (per WURFL XML data)\n\n";
    my $version = $WURFL::dev_attributes::version;
    my @duplicates = ();

    if (keys %$WURFL::dev_attributes::device_attributes > 0) {

        foreach my $dev (keys %$WURFL::dev_attributes::device_attributes) {

            # Process our attributes hash for smaller file size
            my %temp_attrs_hash = ();
            my $fall_back =  $WURFL::dev_attributes::device_attributes->{$dev}->{'fall_back'}  || 'no_fall_back';
            my $user_agent = $WURFL::dev_attributes::device_attributes->{$dev}->{'user_agent'} || 'no_user_agent';

	    # Crude check of data integrity
	    if ($user_agent eq 'no_user_agent') {
		if ($dev eq 'generic')	{
		    $user_agent = 'generic';
		    $fall_back = '';
		} else {
		    die "Missing user agent for device id: ". $dev;
		  }
	    }
	    if ($fall_back eq 'no_fall_back') {
		die "No fallback specified for device id: ". $dev;
	    }
            # Normalize and shorten user agent strings
            $user_agent = &WURFL::Config::user_agent($user_agent);

            # Collect any duplicate user agents
            foreach my $ua_dev (keys %user_agent_hash) {
                if ($user_agent_hash{$ua_dev} eq $user_agent) {
                    push @duplicates, ($dev, $ua_dev);
                }
            }

            # Create a hash of 'new' user agent strings (which is used above for duplicate matching)
            $user_agent_hash{$dev} = $user_agent;

            # We only need the 'user_agent' and 'fall_back' fields
            $temp_attrs_hash{'ua'} = $user_agent;
            $temp_attrs_hash{'fb'} = $fall_back;
            $attributes_hash{$dev} = \%temp_attrs_hash;
        }

        # Convert '%attribute_hash' to perl encoded text
        my $attribute_text = Data::Dumper->Dump([\%attributes_hash], [qw(device_attributes)]);

        # Now, lets make a package of it
        &create_package('dev_attributes', $WURFL::dev_attributes::version, $attribute_text, $wurfl_setup->{wurfl_path});

        # Get only one instance of any duplicate device user agent
        my %seen = ();
        foreach my $item (@duplicates) {
            $duplicates_hash{$item} = $attributes_hash{$item} unless $seen{$item}++;
        }

        # Convert '%duplicates_hash' to perl encoded text
        my $dup_caps_text = Data::Dumper->Dump([\%duplicates_hash], [qw(duplicate_attributes)]);

        # Now, lets make a package of it
        &create_package('dup_attributes', $WURFL::dev_attributes::version, $dup_caps_text, $wurfl_setup->{wurfl_path});

        $print_output =
	    "Completed!<br />\n<br />\nThe dev_attributes.pm (device attributes) temp data file size has been reduced\n" .
	    "by encoding long common string segments and removing 'non-word' characters from 'user agent' strings.\n" .
	    "Since we are going to use uniquely encoded user agent strings for our lookup value, we have\n" .
	    "created a dup_attributes.pm data file for 'user agent' strings which are now identical.\n" .
	    "These duplicate device/user agents will be consolidated in a later step.<br />\n<br />\n" .
		"As shown below, these duplicates are due to uppercase/lowercase and non-word character differences.";

        my @dup_array = ();

        foreach (keys %duplicates_hash) { push @dup_array, $_; }

        @dup_sort = sort @dup_array;

        foreach (@dup_sort) {
            $dup_string .= $_ . " :\n\t" . $WURFL::dev_attributes::device_attributes->{$_}->{'user_agent'} . "\n";
        }
    }
 
    binmode(STDOUT, ":utf8");

    print "Content-type: text/html; charset=utf-8\n\n";
    print "<html><body>\n";
    print "<br />\n<h1 style='text-align:center;'>WURFL Device Data to PERL Data: Step 2</h1>\n";
    print "<h2 style='text-align:center;'><a href='" . $q->url . "?step=3'>Run Step 3 | Reduce Data - Find Duplicates</a></h2>\n";
    print "<p>\n";

    print $print_output;
  
    print "</p>\n\n<pre>\n\n";

    print "Total number of included devices: " . (keys %attributes_hash) . "\n\n";
    print "Number of Duplicate User Agent Strings: " . ($#dup_sort + 1) . "\n\n";

    print $dup_string;

    print "\n\n</pre>\n</body>\n</html>\n";

} elsif ($program_step eq '3') {

    # =======================
    # Step 3:
    # =======================

    require $wurfl_setup->{wurfl_path} . 'dev_attributes.pm';
    require $wurfl_setup->{wurfl_path} . 'dev_capabilities.pm';

    my @user_agents = ();
    my @user_agents_sort = ();
    my %user_agent_position = ();
    my %capabilities_hash = ();
    my $ua_sort_position = '';
    my $print_output = "Failed!<br />\n<br />\nThe script failed to reduce the dev_capabilities.pm file size and produce ua_position.pm data file.";
    my $version = $WURFL::dev_capabilities::version;
    my $caps_ref = $WURFL::dev_capabilities::device_capabilities;
    my $atts_ref = $WURFL::dev_attributes::device_attributes;

    # Substitute short names, T/F's and integers to reduce perl output size
    if (keys %$WURFL::dev_capabilities::device_capabilities > 0) {

        foreach my $dev (keys %$caps_ref) {
            my %temp_group = ();
            foreach my $group (keys %{$caps_ref->{$dev}}) {
                my %temp_caps = ();
                foreach my $caps (keys %{$caps_ref->{$dev}->{$group}}) {
                    my $capability = $caps_ref->{$dev}->{$group}->{$caps};
                    my $value = '';
                    if    ($capability eq 'true')       { $value = 'T'; }
                    elsif ($capability eq 'false')      { $value = 'F'; }
                    elsif ($capability =~ m/^\d+$/)     { $value = int($capability); }
                    else                                { $value = $capability; }
                    $temp_caps{$caps} = $value;
                }
                $temp_group{$group} = \%temp_caps;
            }
            $capabilities_hash{$dev} = \%temp_group;
        }

        my %seen = ();
        foreach my $dev (keys %$WURFL::dev_attributes::device_attributes) {
            my $ua_name = $atts_ref->{$dev}->{ua};
	    # Crude data integrity check...
            if (!$ua_name || $ua_name eq '') { die "Missing user agent string, Step 3"; }
            # Get all our unique user agent strings
            push @user_agents, $ua_name unless $seen{$ua_name}++;
            # Set up a user agent array position index
            $user_agent_position{$ua_name} = -1;
        }

        # Sort our user agent strings
        @user_agents_sort = sort @user_agents;

        # Now locate the user agents in the sorted array and record their array positions
        foreach my $uap (keys %user_agent_position) {
            for (my $i = 0; $i <= $#user_agents_sort; $i++) {
                if ($user_agents_sort[$i] eq $uap) { $user_agent_position{$uap} = $i; }
            }
        }

        # Convert '%capabilities_hash' to perl encoded text
        my $capabilities_text = Data::Dumper->Dump([\%capabilities_hash], [qw(device_capabilities)]);

        # Now, lets make a package of it
        &create_package('dev_capabilities', $WURFL::dev_capabilities::version, $capabilities_text, $wurfl_setup->{wurfl_path});

        $ua_sort_position = Data::Dumper->Dump([\%user_agent_position], [qw(ua_array_position)]);

        # Now, lets make a package of it
        &create_package('ua_position', $WURFL::dev_capabilities::version, $ua_sort_position, $wurfl_setup->{wurfl_path});

        $print_output =
	    "Completed!<br />\n<br />\n" .
	    "The dev_capabilities.pm data file size has been reduced by replacing 'T/F' for 'true/false'\n" .
	    "and changing numeric data to integers.\n" .
	    "Also, the ua_position.pm data file of unique user agent strings (as defined by perl_wurfl.cgi) vs. their numeric position in a sorted array, has been created!";
    }

    binmode(STDOUT, ":utf8");

    print "Content-type: text/html; charset=utf-8\n\n";
    print "<html><body>\n";
    print "<br />\n<h1 style='text-align:center;'>WURFL Device Data to PERL Data: Step 3</h1>\n";
    print "<h2 style='text-align:center;'><a href='" . $q->url . "?step=4'>Run Step 4 | Correct Inconsistencies</a></h2>\n";
    print "<p>\n";

    print $print_output;
  
    print "</p>\n\n<pre >\n\n";

    print "User agent sort position count: " . ($#user_agents_sort + 1) . " [0.." . $#user_agents_sort  . "]\n\n";

    print $ua_sort_position;

    print "\n\n</pre>\n</body>\n</html>\n";

} elsif ($program_step eq '4') {

    # =======================
    # Step 4:
    # =======================

    require $wurfl_setup->{wurfl_path} . 'dev_attributes.pm';
    require $wurfl_setup->{wurfl_path} . 'dev_capabilities.pm';
    require $wurfl_setup->{wurfl_path} . 'dup_attributes.pm';

    my %dup_caps_hash = ();
    my %dup_atts_hash = ();
    my %ua_index_hash = ();
    my %ua_rewrite_hash = ();
    my %ua_resolve_hash = ();
    my $print_output = "Failed!<br />\n<br />\nThe script failed to produce the dup_capabilities.pm file correctly.";
    my $dup_string = "Output grouped by common user agent:\nFor each 'user agent' string - array of all same WURFL device names\n\n";
    my $dup_caps_text = 'Not available';
    my $dup_atts_text =  'Not available';
    my $dup_by_ua_text = 'Not available';
    my $dup_by_ua_resolved = '';
    my $dup_radio_html = '';
    my $dup_input_key_value = '';
    my $dup_no_caps = 'all duplicate devices had capabilities';
    my $version =  $WURFL::dev_capabilities::version;
    my $caps_ref = $WURFL::dev_capabilities::device_capabilities;
    my $dups_ref = $WURFL::dup_attributes::duplicate_attributes;

    if (keys %$WURFL::dev_capabilities::device_capabilities > 0) {

        # Process the form inputs from which the user selected which intersecting 'capability value'
        # to use for a given user agent string. This happens the second time thru step '4'.
        foreach my $p ($q->param) {
            if ($p =~ m/^ua__/) {
                my $input_ua = $p;
                my $input_value = $q->param($p);
                $dup_input_key_value .= "key: '" . $input_ua . "', value: '" . $input_value . "'\n";
                my @input_array = ();
                my %temp_capability = ();
                my %temp_group = ();
                $input_ua =~ s/^ua__//;
                @input_array = split('__', $input_ua);
                if ($ua_resolve_hash{$input_array[0]}) {
                    # Device hash exists, so add to it
                    if ($ua_resolve_hash{$input_array[0]}->{$input_array[1]}) {
                        # Group hash exists, so just add new capability
                        %temp_capability = %{$ua_resolve_hash{$input_array[0]}->{$input_array[1]}};
                        $temp_capability{$input_array[2]} = $input_value;
                        $ua_resolve_hash{$input_array[0]}->{$input_array[1]} = \%temp_capability;
                    } else {
                        %temp_group = %{$ua_resolve_hash{$input_array[0]}};
                        $temp_capability{$input_array[2]} = $input_value;
                        $temp_group{$input_array[1]} = \%temp_capability;
                        $ua_resolve_hash{$input_array[0]} = \%temp_group;
                      }
                } else {
                    # No hash yet, so create it
                    $temp_capability{$input_array[2]} = $input_value;
                    $temp_group{$input_array[1]} = \%temp_capability;
                    $ua_resolve_hash{$input_array[0]} = \%temp_group;
                  }
            }
        }

        # First we pare down the 'duplicates' by looking only at one's with defined capabilities.
        # That is, the one's that didn't just default to another user agent (device id) anyway.
        # This assumes that duplicates with capabilities are "more correct" than those without, which
        # seems like a good assumption (at this writting).
        foreach my $dup (keys %$WURFL::dup_attributes::duplicate_attributes) {
            if (defined $caps_ref->{$dup}) {
                $dup_caps_hash{$dup} = $caps_ref->{$dup};
                $dup_atts_hash{$dup} = $dups_ref->{$dup};

                # Now lets index groups of devices (by the new abbreviated user agent)
                # That is, we only use one user agent but might have multiple 'capability' hashes
                my $ua_name = $dups_ref->{$dup}->{ua};
                # Crude data integrity check...
		if (!$ua_name || $ua_name eq '') { die "Missing user agent string, Step 4"; }
                my @array = ($dup);
                if ($ua_index_hash{$ua_name}) {
                    my $array_ref = $ua_index_hash{$ua_name};
                    push @array, @$array_ref;
                }
                $ua_index_hash{$ua_name} = \@array;
            } else {
		$dup_no_caps .= $dup . "\n";
	      }
        }

        # Now we re-write dupicates hashes, since some elements aren't duplicates now, given assumptions above.
        # Note: This removes 'non-duplicates' from dup hash, since we run step '3' multiple times
        foreach (keys %ua_index_hash) {
            my $array_ref = $ua_index_hash{$_};
            my @array = @$array_ref;
            # If only one device name left, it's not a duplicate any longer
            unless ($array[1]) {
                delete $dup_atts_hash{$array[0]};
                delete $dup_caps_hash{$array[0]};
            }
        }

        if (!%ua_resolve_hash) {
            # Now we re-write the %ua_index_hash by indexing capabilites, given revised duplicates
            foreach my $ua (keys %ua_index_hash) {
                my $array_ref = $ua_index_hash{$ua};
                my @array = @$array_ref;
                # We are only concerned with 'user agents' with multiple device's from WURFL
                if ($array[1]) {
                    my %capabilities = ();
                    foreach my $dev (@array) {
                        my $dup_caps_ref = $dup_caps_hash{$dev};
                        foreach my $group_ref (keys %$dup_caps_ref) {
                            my %results_group = ();
                            foreach my $caps (keys %{$dup_caps_ref->{$group_ref}}) {
                                my $same = 'no';
                                my $value = $dup_caps_ref->{$group_ref}->{$caps};
                                my @results_array = ();
                                if ($ua_rewrite_hash{$ua}->{$group_ref}->{$caps}) {
                                    @results_array = @{$ua_rewrite_hash{$ua}->{$group_ref}->{$caps}};
                                }
                                # Don't bother with values which are the same
                                foreach my $test (@results_array) {
                                    if ($test eq $value) { $same = 'yes'; }
                                }
                                push @results_array, $value unless $same eq 'yes';
                                $results_group{$caps} = \@results_array;
                            }
                            $capabilities{$group_ref} = \%results_group;
                        }
                        $ua_rewrite_hash{$ua} = \%capabilities;
                    }
                }
            }

            # Now generate some html to select which property value will be used for any duplicate capability
            foreach my $ua (keys %ua_rewrite_hash) {
                my $group_ref = $ua_rewrite_hash{$ua};
                foreach my $group (keys %$group_ref) {
                    foreach my $caps (keys %{$group_ref->{$group}}) {
                        my @caps_array = @{$group_ref->{$group}->{$caps}};
                        if ($caps_array[1]) {
                            $dup_radio_html .= "<h3>$ua:<br />$group -&gt; $caps</h3>\n";
                            my $checked = "checked='checked'";
                            foreach my $value (@caps_array) {
                                my $name = 'ua__' . $ua . '__' . $group . '__' . $caps;
                                $dup_radio_html .= "<input type='radio' name='$name' value='$value' $checked />$value<br />\n";
                                $checked = '';
                            }
                        }
                    }
                }
            }
        }

        $dup_radio_html = "<p>A small number of capabilites intersect. That is, because we don't allow duplicate device id's, these previous 'very similar' device capabilities contradict themselves. As you can see, they are mostly slight character differences or data entry errors. Pick the value you think appropiate to use for each device capability.</p>\n" . $dup_radio_html if $dup_radio_html;

        # =======================
        # Create new packages for 'dup_capabilities', 'dup_attributes'
        # =======================

        # Convert new '%dup_caps_hash' to perl encoded text
        $dup_caps_text = Data::Dumper->Dump([\%dup_caps_hash], [qw(duplicate_capabilities)]);

        # Now, lets make a package of it
        &create_package('dup_capabilities', $WURFL::dev_capabilities::version, $dup_caps_text, $wurfl_setup->{wurfl_path});

        # Convert new '%dup_atts_hash' to perl encoded text
        $dup_atts_text = Data::Dumper->Dump([\%dup_atts_hash], [qw(duplicate_attributes)]);

        # Now, lets make a package of it
        &create_package('dup_attributes', $WURFL::dev_capabilities::version, $dup_atts_text, $wurfl_setup->{wurfl_path});

        # =======================
        # Create a package for 'dup_resolved'
        # =======================

        # Convert '%ua_resolve_hash' to perl encoded text
        $dup_by_ua_resolved = Data::Dumper->Dump([\%ua_resolve_hash], [qw(duplicates_resolved_by_ua)]);

        # Now, lets make a package of it
        &create_package('dup_resolved', $WURFL::dev_capabilities::version, $dup_by_ua_resolved, $wurfl_setup->{wurfl_path});
    
        $print_output  =
	    "Completed!<br />\n<br />\n" .
	    "The dup_capabilites.pm (capability info to be consolidated in dev_capabilites.pm later) and dup_resolved.pm\n" .
	    "(generated from the just submitted device info) data files have been created as well as\n" .
	    "the dup_attributes.pm data file (attribute info to be consolidated in dev_attributes.pm later).";

        $dup_string .= Data::Dumper->Dump([\%ua_index_hash], [qw(duplicate_user_agent)]);
    }

    binmode(STDOUT, ":utf8");

    print "Content-type: text/html; charset=utf-8\n\n";
    print "<html><body>\n";
    print "<br />\n<h1 style='text-align:center;'>WURFL Device Data to PERL Data: Step 4</h1>\n";


    # If we have unresolved (intesecting) capabilities, print radio buttons to force a choice
    if ($dup_radio_html) {
        print "\n\n<p>\n<form method='post' action='" . $q->url . "' accept-charset='utf-8'>\n";
        print $dup_radio_html;
        print "\n<br /><input type='hidden' name='step' value='4' />\n<input type='submit' />\n";
        print "</form>\n</p>\n";

        # Now that we know what to use, display outcome and continue to step 4...
    } else {
        print "<h2 style='text-align:center;'><a href='" . $q->url . "?step=5'>Run Step 5 | Generate Perl Data</a></h2>\n";
        print "<p>$print_output</p>\n\n<pre >\n\n";
        print "User inputs, key: -> value:\n\n";
        print $dup_input_key_value . "\n\n";
        print "Resolved User Agents:\n\n";
        print $dup_by_ua_resolved;
        print "\n\nDuplicate User Agent Strings!\n\n";
        print $dup_string;
        print "\n\nReduced to just these intersecting devices:!\n\nBy Capabilities:\n\n";
        print $dup_caps_text;
        print "\n\nBy Attributes:\n\n";
        print $dup_atts_text;
        print "\n\n</pre>\n\n";
	print "<!-- Duplicate devices w/o capabilities\n\n";
	print $dup_no_caps;
	print "\n\n-->\n";
      }
    print "</body>\n</html>\n";

} elsif ($program_step eq '5') {

    # =======================
    # Step 5:
    # =======================

    require $wurfl_setup->{wurfl_path} . 'dev_attributes.pm';
    require $wurfl_setup->{wurfl_path} . 'dev_capabilities.pm';
    require $wurfl_setup->{wurfl_path} . 'dup_resolved.pm';

    my %ua_index_hash = ();
    my %ua_rewrite_hash = ();
    my %ua_attrs_hash = ();
    my $ua_atts_text = ();
    my $ua_caps_text = ();
    my $print_output = "Failed!<br />\n<br />\nThe script failed to produce the ua_attributes.pm and ua_capabilites.pm data files correctly!";
    my $version =  $WURFL::dev_capabilities::version;
    my $caps_ref = $WURFL::dev_capabilities::device_capabilities;
    my $atts_ref = $WURFL::dev_attributes::device_attributes;
    my $resolved = $WURFL::dup_resolved::duplicates_resolved_by_ua;
    my $dumb_var = $WURFL::dup_resolved::duplicates_resolved_by_ua;     # Just to get rid of warnings

    if (keys %$WURFL::dev_capabilities::device_capabilities > 0) {

        # Now we know which duplicate 'device id's' are of intersest (from step '4'), we
        # gather up our attributes and capabilities by 'user agent' similar to step '4'.

        foreach my $dev (keys %$WURFL::dev_attributes::device_attributes) {
            # Create a hash of "device id's" indexed by our sanitized "user agent's"
            my $ua_name = $atts_ref->{$dev}->{ua};
            # Crude data integrity check...
	    if (!$ua_name || $ua_name eq '') { die "Missing user agent string, Step 5"; }
            my $ua_fb   = $atts_ref->{$dev}->{fb};
            my @array = ($dev);
            if ($ua_index_hash{$ua_name}) {
                my $array_ref = $ua_index_hash{$ua_name};
                push @array, @$array_ref;
            }
            $ua_index_hash{$ua_name} = \@array;
            # Create a hash of 'fall back' user agent's indexed by user agent
            $ua_attrs_hash{$ua_name} = $atts_ref->{$ua_fb}->{ua} if $atts_ref->{$ua_fb}->{ua};
        }

        # Now we re-write the %ua_index_hash by indexing capabilites. This is similar
        # to step '4', except we just combine all capabilities per user agent into one hash
        foreach my $ua (keys %ua_index_hash) {
            my $array_ref = $ua_index_hash{$ua};
            my @array = @$array_ref;
            my %capabilities = ();
            foreach my $dev (@array) {
                my $temp_caps = $caps_ref->{$dev};
                foreach my $group_ref (keys %$temp_caps) {
                    my %results_group = ();
                    foreach my $caps (keys %{$temp_caps->{$group_ref}}) {
                        # If the capability exists, just go on to the next one
                        if ($ua_rewrite_hash{$ua}->{$group_ref}->{$caps}) { next; }
                        $results_group{$caps} = $temp_caps->{$group_ref}->{$caps};
                    }
                    $capabilities{$group_ref} = \%results_group;
                }
                $ua_rewrite_hash{$ua} = \%capabilities unless !%capabilities;
            }
        }

        # Now correct the intersecting duplicates we resolved in step '4', (which we just accepted 'as is' above)
        foreach my $res (keys %$resolved) {
            my $group_ref = $resolved->{$res};
            foreach my $group (keys %$group_ref) {
                my $caps_ref = $group_ref->{$group};
                foreach my $caps (keys %$caps_ref) {
                    my $capability = $resolved->{$res}->{$group}->{$caps};
                    if ($capability =~ m/^\d+$/) { $capability = int($capability); }
                    $ua_rewrite_hash{$res}->{$group}->{$caps} = $capability;
                }
            }
        }

        $ua_caps_text = Data::Dumper->Dump([\%ua_rewrite_hash], [qw(ua_capabilities)]);

        # Now, lets make a package of it
        &create_package('ua_caps', $WURFL::dev_capabilities::version, $ua_caps_text, $wurfl_setup->{wurfl_path});

        $ua_atts_text = Data::Dumper->Dump([\%ua_attrs_hash], [qw(ua_attributes)]);

        # Now, lets make a package of it
        &create_package('ua_atts', $WURFL::dev_capabilities::version, $ua_atts_text, $wurfl_setup->{wurfl_path});

        $print_output  = "Completed!<br />\n<br />\nThe ua_atts.pm and ua_caps.pm data files have been created!";
    }

    binmode(STDOUT, ":utf8");

    print "Content-type: text/html; charset=utf-8\n\n";
    print "<html><body>\n";
    print "<br />\n<h1 style='text-align:center;'>WURFL Device Data to PERL Data: Step 5</h1>\n";
    print "<h2 style='text-align:center;'><a href='" . $q->url . "?step=6'>Run Step 6 | Abbreviate Coded User Agent Strings</a></h2>\n";
    print "<p>\n";

    print $print_output;
  
    print "</p>\n\n<pre >\n\n";

    print "Attributes by user agent (per perl_wurfl.cgi) paired to their fall-back user agent (per perl_wurfl.cgi), (count = " . (keys %ua_attrs_hash) . "):\n\n";

    print $ua_atts_text;

    print "Capabilities by user agent:\n\n";
 
    print $ua_caps_text;

    print "\n\n</pre>\n</body>\n</html>\n";

} elsif ($program_step eq '6') {

    # =======================
    # Step 6:
    # =======================

    require $wurfl_setup->{wurfl_path} . 'dev_attributes.pm';

    my @user_agents = ();
    my @user_agents_sort = ();
    my @final_results = ();
    my @final_results_sort = ();
    my $final_ua_sort_text = '';
    my $atts_count = 0;
    my $caps_count = 0;
    my $print_output = "Problem!<br />\n<br />\nThe script encountered a problem! Find '**' string(s) to locate error message.";
    my $results_output = '';
    my $flag_error = 'no';
    my $atts_ref = $WURFL::dev_attributes::device_attributes;

    # Do the same thing as step '3', so ua_position.pm data matches
    my %seen = ();
    foreach my $dev (keys %$WURFL::dev_attributes::device_attributes) {
        my $ua_name = $atts_ref->{$dev}->{ua};
        # Crude data integrity check...
	if (!$ua_name || $ua_name eq '') { die "Missing user agent string, Step 6"; }
        # Get all our unique user agent strings
        push @user_agents, $ua_name unless $seen{$ua_name}++;
    }

    # Sort our user agent strings
    @user_agents_sort = sort @user_agents;

    # Note:	This stuff below is a balancing act. String::Diff is computationally intensive
    #		so we try to reduce the load with &find_differential_user_agent().

    sub string_compare {
    # ---------------

        # Now we start some trimming and comparison of like strings (to reduce size)
        my $i = 0;
        my $base = '';
        my $compare = '';
        my $calc_base = '';
        my $calc_comp = '';

        # Start by setting initial values for our string differential comparison 'while' loop
        ($base, $compare) = &find_differential_user_agent($user_agents_sort[$i], $user_agents_sort[$i + 1]);

        while ($compare) {

	    my $debug_txt = 'string_compare -> ';
	    my $comp_result = '';

            # Search the agent strings for similar strings
            my $diff = String::Diff::diff_fully($base, $compare);
            my $part_1 = $diff->[0]->[0]->[1] || '';
            my $part_2 = $diff->[0]->[1]->[1] || '';

            $calc_base = $part_1 . $part_2;

	    # If less than 7 characters, just use it
	    if (length($base) < 7) {
		$comp_result = $base;
		$debug_txt .= "used \$base";
	    } else {
                if (length($calc_comp) >= length($calc_base)) {
                    my $temp_calc = $calc_comp . '0';
                    # Special case where String::Diff function truncates ending '0' even though it's
                    # needed to differentiate one user agent string from the next!
                    if ($user_agents_sort[$i] =~ m/$temp_calc/) {
                        $comp_result = $temp_calc;
			$debug_txt .= "used \$temp_calc";
                    } else {
                        $comp_result = $calc_comp;
			$debug_txt .= "used \$calc_comp";
                      }
                } else {
                    $comp_result = $calc_base;
		    $debug_txt .= "used \$calc_base";
                  }
              }
            # Reset calculated comparison value
            my $part_3 = $diff->[1]->[0]->[1] || '';
            my $part_4 = $diff->[1]->[1]->[1] || '';

            $calc_comp = $part_3 . $part_4;

	    # Uncomment to warn about potential problems (with results string too small)
	    #if (length($comp_result) < 4) { warn $debug_txt . ' for ' . $comp_result; }

	    # Force string length to 6 character minimum
	    $final_results[$i] = length($comp_result) < 6 ? substr($user_agents_sort[$i], 0, 6) : $comp_result;

            ++$i;

	    # Find a basic common segment for long user agent comparison strings, and return
	    # a managable but unique version (too reduce load on String::Diff)
            ($base, $compare) = &find_differential_user_agent($user_agents_sort[$i], $user_agents_sort[$i + 1]);
        }
        # Add the last one in since it would be lost otherwise (no $compare value)
        $final_results[$i] = $calc_comp;
    }

    # Run string comparison function
    &string_compare();


    # Sort our final user agent strings (for validation)
    @final_results_sort = sort @final_results;

    my %seen2 = ();
    for (my $i = 0; $i <= $#final_results; $i++) {

        my $error_msg = '';

        # Verify sorted vs final results are still the same as they should be (ie: no simple screw-ups)
        if ($final_results_sort[$i] ne $final_results[$i]) {
            $flag_error = 'yes';
            $error_msg = ' ** Sort failed -> sorted: ' . $final_results_sort[$i] . ' ne original: ' . $final_results[$i] . ' at index ' . $i . "\n";
        }

        # Verify there are no duplicates
        my $ua_short = $final_results[$i];
        if ($seen2{$ua_short}++) {
            $flag_error = 'yes';
            $error_msg = ' ** Duplicate failed -> ' . $ua_short . " already in list!\n";
        }
        $results_output .= $final_results[$i] . ' -> ' . $user_agents_sort[$i];
        if ($error_msg) { $results_output = $error_msg . $results_output; }
        else            { $results_output .= "\n"; }
    }

    # We got all the user agents shortened, so use them...
    if ($flag_error ne 'yes') {

	my $error_msg = '';

        # Set 'Data::Dumper' to indentation (0 is none) level
        $Data::Dumper::Indent = $wurfl_setup->{wurfl_dump_indent} || 0;

        require $wurfl_setup->{wurfl_path} . 'ua_atts.pm';
        require $wurfl_setup->{wurfl_path} . 'ua_caps.pm';
        require $wurfl_setup->{wurfl_path} . 'ua_position.pm';

        my $ua_caps_text = '';
        my $ua_atts_text = '';
        my %new_ua_atts = ();
        my %new_ua_caps = ();

        my $caps_ref = $WURFL::ua_caps::ua_capabilities;
        my $atts_ref = $WURFL::ua_atts::ua_attributes;
        my $position = $WURFL::ua_position::ua_array_position;
        my $dumby_ps = $WURFL::ua_position::ua_array_position;

        foreach my $ua (keys %$WURFL::ua_atts::ua_attributes) {
            my $key_index = 'na';
	    if (defined $position->{$ua}) { $key_index = $position->{$ua} }	# key position '0' is defined
	    if ($key_index eq 'na') {
		$error_msg .= " ** Missing key index from postion (for \$WURFL::ua_atts::ua_attributes): " . $ua . "\n";
		$flag_error = 'yes';
		next;
	    }
            my $key_name = $final_results[$key_index] || 'na';
	    if ($key_name eq 'na') {
		$error_msg .= " ** Missing key name from final results (for \$WURFL::ua_atts::ua_attributes): " . $key_index . "\n";
		$flag_error = 'yes';
		next;
	    }
	    my $fb_ua = $atts_ref->{$ua} || 'na';
	    if ($fb_ua eq 'na') {
		$error_msg .= " ** Missing fb user agent (for \$WURFL::ua_atts::ua_attributes): " . $ua . "\n";
		$flag_error = 'yes';
		next;
	    }
            my $fb_index = 'na';
	    if (defined $position->{$atts_ref->{$ua}}) { $fb_index = $position->{$atts_ref->{$ua}} }	# fall back position '0' is defined
	    if ($fb_index eq 'na') {
		$error_msg .= " ** Missing fb index from position (for \$WURFL::ua_atts::ua_attributes): " . $ua . "\n";
		$flag_error = 'yes';
		next;
	    }
            my $fb_name = $final_results[$fb_index];
            $new_ua_atts{$key_name} = $fb_name;
            ++$atts_count;
        }

        foreach my $ua (keys %$WURFL::ua_caps::ua_capabilities) {
	    my $key_index = 'na';
	    if (defined $position->{$ua}) { $key_index = $position->{$ua} }	# key position '0' is defined
	    if ($key_index eq 'na') {
		$error_msg .= " ** Missing key index from postion (for \$WURFL::ua_caps::ua_capabilities): " . $ua . "\n";
		$flag_error = 'yes';
		next;
	    }
            my $key_name = $final_results[$key_index] || 'na';
	    if ($key_name eq 'na') {
		$error_msg .= " ** Missing key name from final results (for \$WURFL::ua_caps::ua_capabilities): " . $key_index . "\n";
		$flag_error = 'yes';
		next;
	    }
	    $new_ua_caps{$key_name} = $caps_ref->{$ua};
	    ++$caps_count;
        }

        $ua_caps_text = Data::Dumper->Dump([\%new_ua_caps], [qw(ua_capabilities)]);

        # Now, lets make a package of it
        &create_package('ua_caps', $WURFL::dev_attributes::version, $ua_caps_text, $wurfl_setup->{wurfl_path});

        $ua_atts_text = Data::Dumper->Dump([\%new_ua_atts], [qw(ua_attributes)]);

        # Now, lets make a package of it
        &create_package('ua_atts', $WURFL::dev_attributes::version, $ua_atts_text, $wurfl_setup->{wurfl_path});

        if ($error_msg) { $results_output = $error_msg . "\n" . $results_output; }
        else            { $results_output .= "\n"; }
    }

    $print_output  =
	"Completed!<br />\n<br />\nOur previously defined unique user agent strings\n" .
	"have been shortened again to very short, but still unique strings and then substituted\n" .
	"into our ua_attr.pm and ua_caps.pm module data files!<br />\n<br />\n" .
	"This is important because shortened user agent strings are easier to process." unless $flag_error eq 'yes';

    binmode(STDOUT, ":utf8");

    print "Content-type: text/html; charset=utf-8\n\n";
    print "<html><body>\n";
    print "<br />\n<h1 style='text-align:center;'>WURFL Device Data to PERL Data: Step 6</h1>\n";
    print "<h2 style='text-align:center;'><a href='" . $q->url . "?step=7'>Run Step 7 | Final Check</a></h2>\n";
    print "<p>\n";

    print $print_output;
  
    print "</p>\n\n<pre >\n\n";

    print "Number of attribute user agents -> " . $atts_count . "\n";
    print "Number of capability user agents -> " . $caps_count . "\n";
    print "From total available -> " . ($#final_results + 1) . "\n\n";

    print "User agent reduced vs original:\n\n";

    print $results_output;

    print "\n\n</pre>\n</body>\n</html>\n";

} elsif ($program_step eq '7') {

    # =======================
    # Step 7:
    # =======================

    require $wurfl_setup->{wurfl_path} . 'ua_atts.pm';
    require $wurfl_setup->{wurfl_path} . 'ua_caps.pm';

    my $atts_ref = $WURFL::ua_atts::ua_attributes;
    my $caps_ref = $WURFL::ua_caps::ua_capabilities;

    my $user_agent_length = 0;
    my $group_length = 0;
    my $name_length = 0;
    my $value_length = 0;
    my $flag_config = 'no';

    my $ua_build_dup = '';
    my $print_output = "Completed!<br />\n<br />\nNo problems found in WURFL-Perl data!";
    my $flag_output  = "\n<br /><br />\nImportant! You must edit the Config.pm to change the following parameter(s) before running the 'Create MySQL Tables' link to create a MySQL db. The current WURFL data requires larger 'VARCHAR' lengths.\n<br />";
    my $results_output = "No changes made to ua_atts.pm file\n\n";

    # Check that 'fallback' user agents drill down and don't call back to themselves

    eval {
	local $SIG{ALRM} = sub { die "Checking user agent's build lists (Step 7) timed out!\n" };
	alarm 10;

	foreach my $ua (keys %$WURFL::ua_atts::ua_attributes) {

            my @ua_build = ($ua);	# add start user agent
            my $build_ua = $ua;

	    while ((defined $build_ua) && (defined $atts_ref->{$build_ua}) && ($atts_ref->{$build_ua} ne '')) {
		$build_ua = $atts_ref->{$build_ua};
		foreach (@ua_build) {
		    if ($build_ua eq $_) {
			# get rid of bad user agents
			$ua_build_dup .= "deleted\t" . $build_ua . "\n" if delete $atts_ref->{$build_ua};
			$build_ua = undef;
		    }
		}
		push @ua_build, $build_ua if defined $build_ua;
            }
	}

	alarm 0;
    };

    if ($ua_build_dup) {

	# stop 'used once' warning
	my $version = $WURFL::ua_atts::version;
	
        # Set 'Data::Dumper' to indentation (0 is none) level
        $Data::Dumper::Indent = $wurfl_setup->{wurfl_dump_indent} || 0;

        my $ua_atts_text = Data::Dumper->Dump([$atts_ref], [qw(ua_attributes)]);

        # Now, lets make a package of it
        &create_package('ua_atts', $WURFL::ua_atts::version, $ua_atts_text, $wurfl_setup->{wurfl_path});

	$print_output  = "Completed!<br />\n<br />\nErrant user agent 'fallbacks' have been removed!";
	$results_output = "These ua_atts.pm entries removed because they now\ncalled themselves as 'fallback' devices (ie: no duplicates):\n\n";
	$results_output .= $ua_build_dup;
    }

    # Get/check for the longest string lengths for our perl data
    foreach my $ua_string (keys %$WURFL::ua_atts::ua_attributes) {
	if (length($ua_string) > $user_agent_length) { $user_agent_length = length($ua_string); }
    }

    foreach my $ua_name (keys %$WURFL::ua_caps::ua_capabilities) {
	my $group_ref = $caps_ref->{$ua_name};
	foreach my $group (keys %$group_ref) {
	    if (length($group) > $group_length)	{ $group_length = length($group);   }
	    my $capbability_ref = $group_ref->{$group};
	    foreach my $cap_key (keys %$capbability_ref) {
		my $cap_val = $capbability_ref->{$cap_key};
		if (length($cap_key) > $name_length)	{    $name_length = length($cap_key); }
		if (length($cap_val) > $value_length)	{   $value_length = length($cap_val); }
	    }
	}
    }

    $print_output .= "\n<br />\nMax user agent string length: "		. $user_agent_length;
    $print_output .= "\n<br />\nMax group string length: "		. $group_length;
    $print_output .= "\n<br />\nMax capabilitiy name string length: "	. $name_length;
    $print_output .= "\n<br />\nMax capabilitiy value string length: "	. $value_length;

    if ($user_agent_length > $wurfl_setup->{user_agent_vc_length}) {
	$flag_output .= "\n<br />\nIncrease Config.pm 'user_agent_vc_length' to something &gt; "	. $user_agent_length;
	$flag_config = 'yes';
    }

    if ($group_length > $wurfl_setup->{group_vc_length}) {
	$flag_output .= "\n<br />\nIncrease Config.pm 'group_vc_length' to something &gt; "		. $group_length;
	$flag_config = 'yes';
    }

    if ($name_length > $wurfl_setup->{name_vc_length}) {
	$flag_output .= "\n<br />\nIncrease Config.pm 'name_vc_length' to something &gt; "		. $name_length;
	$flag_config = 'yes';
    }

    if ($value_length > $wurfl_setup->{value_vc_length}) {
	$flag_output .= "\n<br />\nIncrease Config.pm 'value_vc_length' to something &gt; "		. $value_length;
	$flag_config = 'yes';
    }

    if ($flag_config eq 'yes') {
	$print_output .= $flag_output;
    }

    binmode(STDOUT, ":utf8");

    print "Content-type: text/html; charset=utf-8\n\n";
    print "<html><body>\n";
    print "<br />\n<h1 style='text-align:center;'>WURFL to PERL Final Check: Step 7</h1>\n";
    print "<h2 style='text-align:center;'><a href='" . $q->url . "?step=8'>Run Step 8 | Clean Up Working Files</a></h2>\n";
    print "<p>\n";

    print $print_output;

    print "</p>\n\n<pre >\n\n";

    print $results_output;

    print "\n\n</pre>\n</body>\n</html>\n";

} elsif ($program_step eq '8') {

    # =======================
    # Step 8:
    # =======================

    my $deleted = 0;
    my $print_output = "Failed!<br />\n<br />\nThe script failed to remove temporary files!";
    my $results_output = '';

    $deleted = unlink   $wurfl_setup->{wurfl_path} . 'dev_attributes.pm',
                        $wurfl_setup->{wurfl_path} . 'dev_capabilities.pm',
                        $wurfl_setup->{wurfl_path} . 'dup_attributes.pm',
                        $wurfl_setup->{wurfl_path} . 'dup_capabilities.pm',
                        $wurfl_setup->{wurfl_path} . 'dup_resolved.pm',
                        $wurfl_setup->{wurfl_path} . 'ua_position.pm';

    $print_output  = "Completed!<br />\n<br />\nTemporary files have been removed!" if $deleted == 6;
    $results_output = "dev_attributes.pm\ndev_capabilities.pm\ndup_attributes.pm\ndup_capabilities.pm\ndup_resolved.pm\nua_position.pm" if $deleted == 6;

    binmode(STDOUT, ":utf8");

    print "Content-type: text/html; charset=utf-8\n\n";
    print "<html><body>\n";
    print "<br />\n<h1 style='text-align:center;'>WURFL Device Data Clean Up: Step 8</h1>\n";
    print "<h2 style='text-align:center;'><a href='" . $q->url . "?step=9'>Run Step 9 | Create MySQL Tables</a></h2>\n";
    print "<p>\n";

    print $print_output;

    print "</p>\n\n<pre >\n\n";

    print "These files were removed:\n\n";

    print $results_output;

    print "\n\n</pre>\n</body>\n</html>\n";

} elsif ($program_step eq '9') {

    # =======================
    # Step 9:
    # =======================

    my $print_output = "Failed!<br />\n<br />\nThe script failed to connect or create tables for the MySQL database!";
    my $results_output = '';
    my $flag_done = 'yes';

    if ($wurfl_setup->{'access'}->connect_db()) {
	$results_output .= "Connected to MySQL db: " . $wurfl_setup->{db_descriptor} . " as " . $wurfl_setup->{db_username} . "\n";
    } else {
	$results_output .= "Could not connected to MySQL db: " . $wurfl_setup->{db_descriptor} . " as " . $wurfl_setup->{db_username} . "\n";
	$results_output .= "You first need to create a MySQL db as defined in WURFL::Config.pm\n";
	$flag_done = 'no';
      }

    if ($flag_done eq 'yes') { $wurfl_setup->create_tables(); }

    if ($flag_done eq 'yes') {
	if ($wurfl_setup->{'access'}->tables_exist()) {
	    $results_output .= "Created tables for the MySQL db using the following SQL statement:\n\n";
	} else {
	    $results_output .= "There was a problem creating the tables for the MySQL db, ref. SQL statement:\n\n";
	    $flag_done = 'no';
	  }
	$results_output .= $wurfl_setup->{create_table_sql} . "\n";
    }

    $print_output  = "Completed!<br />\n<br />\nThe MySQL db is ready to populate with WURFL data!" if $flag_done eq 'yes';

    binmode(STDOUT, ":utf8");

    print "Content-type: text/html; charset=utf-8\n\n";
    print "<html><body>\n";
    print "<br />\n<h1 style='text-align:center;'>WURFL Data to MySQL: Step 9</h1>\n";
    if ($flag_done eq 'yes') {
	print "<h2 style='text-align:center;'><a href='" . $q->url . "?step=10'>Run Step 10 | Populate MySQL Db w/ Perl Data</a></h2>\n";
    } else {
	print "<h2 style='text-align:center;'><a href='" . $q->url . "?step=9'>Re-Run Step 9</a></h2>\n";
      }
    print "<p>\n";

    print $print_output;

    print "</p>\n\n<pre >\n\n";

    print "Results of MySQL db Check:\n\n";

    print $results_output;

    print "\n\n</pre>\n</body>\n</html>\n";

}elsif ($program_step eq '10') {

    # =======================
    # Step 10:
    # =======================

    my $print_output = "Failed!<br />\n<br />\nThe script failed to correctly input data to tables for the MySQL database!";
    my $results_output = '';
    my $flag_done = 'yes';
    my $site_wurfl_url = $q->url;
       $site_wurfl_url =~ s/perl_wurfl\.cgi/site_wurfl\.cgi/;


    require $wurfl_setup->{wurfl_path} . 'ua_atts.pm';
    require $wurfl_setup->{wurfl_path} . 'ua_caps.pm';

    my $atts_ref = $WURFL::ua_atts::ua_attributes;
    my $caps_ref = $WURFL::ua_caps::ua_capabilities;

    if ($wurfl_setup->{'access'}->connect_db()) {
	$results_output .= "Connected to MySQL db: " . $wurfl_setup->{db_descriptor} . " as " . $wurfl_setup->{db_username} . "\n";
    } else {
	$results_output .= "Could not connected to MySQL db: " . $wurfl_setup->{db_descriptor} . " as " . $wurfl_setup->{db_username} . "\n";
	$results_output .= "Missing MySQL db or MySQL server failed!\n";
	$flag_done = 'no';
      }

    if ($flag_done eq 'yes') { $wurfl_setup->build_tables($atts_ref, $caps_ref); }

    if ($flag_done eq 'yes') {
	if ($wurfl_setup->{'access'}->tables_exist()) {
	    $results_output .= "Tables successfully built for the MySQL db.\n";
	} else {
	    $results_output .= "There was a problem building the tables for the MySQL db.\n";
	    $flag_done = 'no';
	  }
    }

    $print_output  = "Completed!<br />\n<br />\nThe MySQL db is ready to use!" if $flag_done eq 'yes';

    binmode(STDOUT, ":utf8");

    print "Content-type: text/html; charset=utf-8\n\n";
    print "<html><body>\n";
    print "<br />\n<h1 style='text-align:center;'>WURFL Data to MySQL: Step 10</h1>\n";
    print "<h2 style='text-align:center;'><a href='" . $site_wurfl_url . "'>Run Site-WURFL Demo of Db Access</a></h2>\n";
    print "<p>\n";

    print $print_output;

    print "</p>\n\n<pre >\n\n";

    print "Results of MySQL db Build:\n\n";

    print $results_output;

    print "\n\n</pre>\n</body>\n</html>\n";

} else {

    # =======================
    # Default page:
    # =======================

    my $site_wurfl_url = $q->url;
       $site_wurfl_url =~ s/perl_wurfl\.cgi/site_wurfl\.cgi/;

    if	  ($program_action eq 'local') { $wurfl_setup->get_local_stats(); }
    elsif ($program_action eq 'rmote') { $wurfl_setup->check_remote();    }
    elsif ($program_action eq 'downl') { $wurfl_setup->get_wurfl();	  }

    # Use manually (from address bar). Note: This is dangerous so only allow
    # access to this script when updating the WURFL to Perl Data!
    elsif ($program_action eq 'clean') {
	$wurfl_setup->cleanup();
	my $atts_file = $wurfl_setup->{wurfl_path} . 'ua_atts.pm';
	my $caps_file = $wurfl_setup->{wurfl_path} . 'ua_caps.pm';
	if (-e $atts_file) { unlink $atts_file || die "&" . (caller(0))[3] . " -> can't remove $atts_file: $!\n"; }
	if (-e $caps_file) { unlink $caps_file || die "&" . (caller(0))[3] . " -> can't remove $caps_file: $!\n"; }
    }

    binmode(STDOUT, ":utf8");

    print "Content-type: text/html; charset=utf-8\n\n";
    print "<html><body>\n";
    print "<h1 style='text-align:center;'>WURFL Device Data to PERL Data: Start</h1>\n";

    if		($wurfl_setup->{wurfl_action} eq 'download') {
	print "<h2 style='text-align:center;' title='Download WURFL Data'>		<a href='" . $q->url . "?action=downl'>Download WURFL File</a></h2>\n";
    } elsif	($wurfl_setup->{wurfl_action} eq 'continue') {
	$wurfl_setup->{wurfl_status} .= "Click 'Check Local vs. Remote' to see if your WURFL data is current.\n";
	print "<h2 style='text-align:center;' title='Check local WURFL Data'>		<a href='" . $q->url . "?action=local'>Check Local File</a></h2>\n";
	print "<h2 style='text-align:center;' title='Check local vs. remote WURFL Data'><a href='" . $q->url . "?action=rmote'>Check Local vs. Remote File</a></h2>\n";
	print "<h2 style='text-align:center;' title='Run Perl/MySQL WURFL demo script'><a href='" . $site_wurfl_url . "'>Site-WURFL Demo</a></h2>\n" if -e $wurfl_setup->{wurfl_path} . 'ua_caps.pm';
    } elsif	($wurfl_setup->{wurfl_action} eq 'db_ready') {
	print "<h2 style='text-align:center;' title='Run Perl extraction of WURFL data'><a href='" . $q->url . "?step=1'>Run Step 1 | XML -> Perl</a></h2>\n";
      }

    print "\n<!-- current wurfl_action is '" . $wurfl_setup->{wurfl_action} . "' -->\n\n";
    print "<pre >\n";
    print $wurfl_setup->{wurfl_status};
    print "\n\n</pre></body></html>\n";
}




#  SUBROUTINES
# =========================================================



BEGIN {

  sub handle_errors {

    my $msg = shift;
    my $as_sub = shift || 'no';

    binmode(STDOUT, ":utf8");

    if ($as_sub eq 'yes') {
      print "Content-type: text/html; charset=utf-8\n\n";
    }
    print "<html><body><div style='text-align:center;'>";
    print "<br /><h1>'Perl-WURFL' error message!</h1>";
    print "<p>$msg</p>\n";
    print "</div></body></html>\n";
    exit; 
  }
  set_message(\&handle_errors);
}


sub gen_filehandle { local *FILEHANDLE; return *FILEHANDLE; }


sub open_file {
# --------------------------------------------------------

my $fh = shift;
my $full_file = shift;
my $error_message = shift;

my $content = '';

unless ( -e $full_file )   { &handle_errors( "Open File - Unable to open file. The file does not exist!", 'yes' ); }
unless ( -r $full_file )   { &handle_errors( "Open File - Unable to read file. Read permissions are not granted!", 'yes' ); }

open($fh, "< $full_file") or &handle_errors( "Open File - Subroutine error!<br />$error_message<br />$!", 'yes' );
while (<$fh>) { $content .= $_; }
close $fh or &handle_errors( "Open File - Unable to close file!<br />$!", 'yes');

return \$content;
}


sub create_package {
# --------------------------------------------------------

my $package_name = shift;
my $package_vers = shift;
my $package_text = shift;
my $base_path = shift;

my $package_file = $base_path . $package_name . '.pm';

my $temp_text = '';

$temp_text .= 'package WURFL::' . $package_name . ";\n\n";
$temp_text .= "#\n# Created from WURFL version: " . $package_vers . "\n#\n\n";
$temp_text .= "\$version = '" . $package_vers . "';\n\n";
$temp_text .= $package_text;
$temp_text .= "\n\n1;";


 open(CFG, "> $package_file") || &handle_errors( "Could not create package: $package_name<br />$!", 'yes' );
print CFG $temp_text;
close(CFG);

$set_perm->( 0755, $package_file, 'Unable to chmod/set mask' );
}


sub find_differential_user_agent {
# --------------------------------------------------------

my $base_ua = shift;
my $comp_ua = shift;
my $length_ua = shift || 6;
my $length_new = $length_ua + 3;

# Stop since comparison is over...
if (!$comp_ua) { return ($base_ua, ''); }

# Stop subroutine at some point because something doesn't look right
if ($length_new > 100) {
    # A future string comparison > 100 characters may be required, just increase as needed (was 80 in 2013).
    # (I typically find common substrings and use substitution in Config.pm file to reduce size: see sub user_agent)
    die "find_differential_user_agent -> There was a problem finding a viable user agent string for base:\n" . $base_ua . ", compare:\n" . $comp_ua;
}

if ($length_ua > 60 && $length_ua < 65) {
    # Just send a warning about extra long ua's. Common string segments can be encoded/shortened in Config.pm
    warn "Note this ex-long ua: " . $base_ua;
}

my $base_substring = substr($base_ua, 0, $length_ua);
my $comp_substring = substr($comp_ua, 0, $length_ua);

if (($base_substring =~ m/[a-z_]/i) && ($base_substring ne $comp_substring)) {
    if (length($base_ua) > $length_new) {
        $base_ua = substr($base_ua, 0, $length_new);
    }
    if (length($comp_ua) > $length_new) {
        $comp_ua = substr($comp_ua, 0, $length_new);
    }
} else {
    ($base_ua, $comp_ua) = &find_differential_user_agent($base_ua, $comp_ua, $length_new);
  }
return ($base_ua, $comp_ua);
}
