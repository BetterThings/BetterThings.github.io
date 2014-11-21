#!/usr/bin/perl
use utf8;
use open ':utf8';
use Encode 'decode_utf8';
use warnings;
#
# Copyright Notice:
my $script_name = 'Site-WURFL';
my $script_vers = '14.4.16';
my $script_date = 'Apr. 16, 2014';
my $script_year = '2013';

#  Copyright© - OpenSiteMobile
my $copyright_year = '2008-2014';

#  All rights reserved
#
# Description:
#
# Site-Wurfl is a simple perl script used to test/demo the access of WURFL Data via Perl
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
use WURFL::Config;
use WURFL::Access;
use Text::Levenshtein;
use JSON;
use MSOS::Base;
use strict;

$CGI::POST_MAX=1024 * 25;	# max 25K posts
$CGI::DISABLE_UPLOADS = 1;	# no uploads
$CGI::HEADERS_ONCE = 1;		# one set of HTTP headers please

BEGIN { set_message(\&MSOS::Base::handle_errors); }

my %def = ();
my $q = new CGI;
my $w = WURFL::Access::new_wurfl($WURFL::Config::config_vars);
my $accept = $ENV{"HTTP_ACCEPT"};
my $output_json = '{ "missing" : "output" }';

%def = (
    'script_url'    => $q->url,
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

if ($accept =~ /application\/json/) {
    # If a javascript json request comes in...

    # Get WURFL Capabilities for this user
    &generate_wurfl_caps($q, \%def);

    print $q->header(

        -type => 'application/json; charset=utf-8',
        -expires => '+3d'
    );

    # Add lookup user agent info (for ref.)
    $def{'wurfl_ua_capability'}{'site_wurfl'} = {
        'user_agent' => $def{'http_user_agent'},
        'encoded_ua' => $def{'encoded_user_agent'}
    };

    $output_json = to_json($def{'wurfl_ua_capability'}, { utf8 => 1 });

    print $output_json;

} else {

    # Get WURFL Capabilities for this user
    &generate_wurfl_caps($q, \%def);

    # Otherwise, output our demo page
    print $q->header(

        -type		=> $def{'content_type'},
        -expires	=> 'now',
        -last_modified	=> scalar(gmtime)
    );

    &print_body($q, \%def);
}

#  End of Script
# =========================================================



#  SUBROUTINES
# =========================================================

sub print_body {
# -----------------------------

    my $r = shift;
    my $dref = shift;

    my $possibiles = '';
    my $ua_build_text = '';
    my $ua_capab_text = '';

    my $capabilities = $dref->{'wurfl_ua_capability'};

    foreach (@{$dref->{'wurfl_ua_possibles'}})	{ $possibiles	.= "<li>" . $_ . "</li>\n"; }
    foreach (@{$dref->{'wurfl_ua_build'}})		{ $ua_build_text.= "<li>" . $_ . "</li>\n"; }

    foreach my $group (sort {lc($a) cmp lc($b)} keys (%$capabilities)) {
        $ua_capab_text .= "<li><span style='color: red;'>" . $group . "</span>:<br />\n";
        foreach my $capability (sort {lc($a) cmp lc($b)} keys (%{$capabilities->{$group}})) {
            $ua_capab_text .= " .. $capability: " . $capabilities->{$group}->{$capability} . "<br />\n";
        }
        $ua_capab_text .= "<br /></li>\n";
    }

print qq~

    <section>
        <h2>WURFL Data via Perl/MySQL</h2>

        <div class='pgrph well'>
            Here is the output from our WURFL Data via Perl/MySQL device capabilities lookup, for your
			current user agent string. Use this page to test mobile devices against your WURFL Data via
			Perl/MySQL installation. Use a 'User Agent Switcher' in your favorite browser, or different
			devices, and watch the output change accordingly. 
        </div>

		<div class='msos_legend'>
			<h2>WURFL Info</h2>
			<div style='overflow-x:auto; padding:5px 0 10px 0;'>
				<ul>
					<li>HTTP user agent:<br />$dref->{'http_user_agent'}</li>
					<li>Encoded user agent:<br />$dref->{'encoded_user_agent'}</li>
				</ul>
			</div>
		</div>

		<div class='msos_legend'>
			<h2>List of Possible User Agent Match</h2>
			<div style='overflow-x:auto; padding:5px 0 10px 0;'>
				<ul>
					$possibiles
				</ul>
			</div>
		</div>

		<div class='msos_legend'>
			<h2>WURFL-Perl Build w/Fall-backs</h2>
			<div style='overflow-x:auto; padding:5px 0 10px 0;'>
				<ul>
					$ua_build_text
				</ul>
			</div>
		</div>

		<div class='msos_legend'>
			<h3>User Agent Capabilities</h3>
			<div style='overflow-x:auto; padding:5px 0 10px 0;'>
				<ul class="msos_list">
					$ua_capab_text
				</ul>
			</div>
		</div>
    </section>

~;

    print "\n<pre style='text-align:left;'>\n$dref->{'debug'}</pre>\n" if $r->param('debug') && ($r->param('debug') eq 'yes');
}

sub generate_wurfl_caps {
# -----------------------------

    my $r = shift;
    my $dref = shift;

    my $env_user_agent = $ENV{'HTTP_USER_AGENT'} || '';
    my @possible_ua_string	= ();

    $dref->{'http_user_agent'} = $env_user_agent || 'na';

    # We use Text::Levenshtein to measure the degree of
    # proximity between two strings

    if ($env_user_agent) {

        # Get 'cleaned up' user agent for comparison to Perl WURFL data
        $env_user_agent = &WURFL::Config::user_agent($env_user_agent);

        $dref->{'debug'} .= "Encoded ua:\n" . $env_user_agent . "\n\n";

        # First we do a brute search for possible matching user agent strings via simple sql statements
        # to MySQL. It is important to note that we don't want to discount variations hidden by a simple search,
        # but we do want to limit the list (so as not to overwhelm the 'Levenshtein' algorithm)
        @possible_ua_string = &get_possible_matches_mysql($dref, $env_user_agent);

        if (@possible_ua_string) {

            my $index = 0;
            my $compare = 1000;

            # Now get a numeric value for which one matches the best
            # (lowest number of changes to be the same: ref. 'Levenshtein.pm')
            my @distances = &Text::Levenshtein::distance($env_user_agent, @possible_ua_string);

            for (my $i = 0; $i <= $#distances; $i++) {
                if ($distances[$i] < $compare) {
                    $compare = $distances[$i];
                    $index = $i;
                }
            }

            my $build_user_agent = $possible_ua_string[$index];

            $dref->{'wurfl_ua_capability'} = &get_match_capabilities_mysql($dref, $build_user_agent);

        } else {
            $dref->{'debug'} .= "Error: No user agent matches.\n\n";
          }
    }

    # Output some WURFL variables for debugging
    $dref->{'encoded_user_agent'} = $env_user_agent;
    $dref->{'wurfl_ua_possibles'} = \@possible_ua_string;
}

sub get_substring_matches {
# -----------------------------

    my $array_ref = shift;
    my $user_agent = shift;
    my $string_idx = shift;

    my $env_ua_sub = substr($user_agent, 0, $string_idx);
    my @new_matches = ();

    foreach (@$array_ref) { push @new_matches, $_ if $_ =~ m/^$env_ua_sub/; }

    return @new_matches;
}

sub get_possible_matches_mysql {
# -----------------------------

    my $dref = shift;
    my $u_agent = shift;

    my @match = ();
    my $index = 4;
    my $init_matches = 0;

    # Get 1st three matching character
    @match = $w->get_user_agents($u_agent);

    $init_matches = $#match;

    $dref->{'debug'} .= " Ref. - get_possible_matches_mysql:\n";
    $dref->{'debug'} .= "Initial user agent matches:\n" . (join("\n", @match)) . "\n\n";

    # Then just do the same starting at 4th character...
    while ($#match > 10 && $index < 40) {
        my @new_match = @match;
        @match = &get_substring_matches(\@new_match, $u_agent, $index);
        if ($#match < 2) {
            # went too far...
            @match = @new_match;
            last;
        }
        ++$index;
    }

    $dref->{'debug'} .= " Ref. - get_possible_matches_mysql:\n";
    $dref->{'debug'} .= "Matched user agent string to character at index: " . ($index - 1) . " for " . $init_matches . " initial matches\n";
    $dref->{'debug'} .= "Possibile user agent matches:\n" . (join("\n", @match)) . "\n\n";
    $dref->{'debug'} .= "HTTP_ACCEPT is: " . $accept . "\n\n";
    return @match;
}

sub get_match_capabilities_mysql {
# -----------------------------

    my $dref = shift;
    my $build_ua = shift;

    my $uab		 = '';
    my @ua_build	 = ();
    my @ua_build_txt = ();
    my %capabilities = ();

    my $caps_ref = undef;

    # Gather up 'fallback' user agents, as available
    @ua_build = ($build_ua);	# add initial user agent

    while (defined $build_ua) {
        # Get new build user agent (from fall-back)
        $build_ua = $w->get_fall_back($build_ua);

        foreach (@ua_build) {
            if ($build_ua && $build_ua eq $_) {
                # This shouldn't happen, but record it if it does
                warn "Found a potential problem with the WURFL data. This user agent calls a previous fall-back: " . $build_ua . ' in ' . (join(', ', @ua_build));
                $build_ua = undef;
            }
        }
        push @ua_build, $build_ua if $build_ua;
    }

    @ua_build_txt = @ua_build;

    # Roll up all the capabilities for each user agent as they 'build' the final capability hash.

    while ($uab = pop(@ua_build)) {

        # Get the capabilities for each encoded user agent
        $caps_ref = $w->get_ua_capabilities($uab);

        # Bundle up user_agent match and all fall-back user_agents
        foreach my $grp (keys (%$caps_ref)) {
            foreach my $capable (keys (%{$caps_ref->{$grp}})) {
                $capabilities{$grp}->{$capable} = $caps_ref->{$grp}->{$capable};
            }
        }
    }

    $dref->{'wurfl_ua_build'} = \@ua_build_txt;

    return \%capabilities;
}

