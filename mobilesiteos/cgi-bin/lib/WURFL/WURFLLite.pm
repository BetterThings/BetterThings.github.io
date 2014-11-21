package WURFL::WURFLLite;
##
## Copyright (c) 2002-2006 Rainer Hillebrand, rainer.hillebrand@webcab.de.
## All rights reserved.
##
## This program is free software; you can redistribute it
## and/or modify it under the same terms as Perl itself.
##
## The latest version can be found at:
##   http://webcab.de/WURFL/
##
## Based on RSSLite.pm 0.06 by Scott Thomason

use strict;
use vars qw(@ISA @EXPORT @EXPORT_OK %EXPORT_TAGS $VERSION);
use Exporter;


@ISA = ('Exporter');
@EXPORT = qw/parseXML usableXML/;
@EXPORT_OK = qw/parseXML usableXML
                isWURFL
                xml_attributes_hash xml_content_string xml_content_array/;
$VERSION = '0.06'; # 2006-06-07

use Carp;
use Data::Dumper;

sub parseXML {
  my ($rr, $cr) = @_;

  die "Parms to 'parse' must be refs to a hash and XML content!"
    unless (ref($rr) and ref($cr));

  return unless $$cr; ## Gotta have some content to parse

  my $type = usableXML($cr)
    or die "Content must be WURFL XML (or something pretty close)\n";

  preprocess($cr);
  if ($type == 1) {
    parseWURFL($rr, $cr);
  }
  else {
    die "Screwed up XML type-checking somehow!\n";
  }
}

sub preprocess {
  my $cr = shift;

  ##
  ## Help create "well-formed" XML so parser doesn't puke by
  ## 1. Making unix-style line endings
  ## 2. Using &amp; for & (this screws up urls, but we fix it later)
  ## 3. Removing objectionable characters
  ## 4. Removing comments (thanks to Ken Neighbors)
  ##
  $$cr =~ s|\Q<![CDATA[\E||g;
  $$cr =~ s|\Q]]>\E||g;
  $$cr =~ s|<([^<> ]+)\s+(.+?)\s+/>|<$1 $2></$1>|g;
  $$cr =~ s/\r\n?/\n/g;
  $$cr =~ s/&(?!([a-zA-Z0-9]+|#\d+);)/&amp;/g;
  $$cr =~ s/[^\s\d\w!@#\$%^&\*i\(\)\-\+=:;"'<>,\.\/\?]/ /g;
  $$cr =~ s/<!--(?:[^-]|(?:-[^-]))*-->//gs;
}

sub parseWURFL {
  my ($rr, $cr) = @_;

  my $version = xml_content_string('version', $cr);
  foreach my $element ('ver', 'last_updated', 'official_url', 'statement') {
    my $value = xml_content_string($element, \$version);
    $rr->{'versions'}->{$element} = $value if defined $element;
  }
  foreach my $element ('maintainer', 'author', 'contributor') {
    my @elements = xml_content_array($element, \$version);
    my $i = 1;
    while (my $tagged_element = shift(@elements)) {
      my %element_attributes = xml_attributes_hash($element, \$tagged_element);
      $rr->{'versions'}->{$element . 's'}->{$i} = \%element_attributes;
      $i++
    }
  }
  my $devices = xml_content_string('devices', $cr);
  foreach my $device (xml_content_array('device', \$devices, 1)) {
    my %attributes = xml_attributes_hash('device', \$device);
    my $device_id = $attributes{'id'};
    $rr->{'devices'}->{$device_id}->{'attributes'} = \%attributes if defined $device_id;
    foreach my $group (xml_content_array('group', \$device, 1)) {
      my %group_attributes = xml_attributes_hash('group', \$group);
      my $group_id = $group_attributes{'id'};
      foreach my $capability (xml_content_array('capability', \$group, 1)) {
        my %capabilities = xml_attributes_hash('capability', \$capability);
        $rr->{'devices'}->{$device_id}->{'capabilities'}->{$group_id}->{$capabilities{'name'}} = $capabilities{'value'} if defined $capabilities{'name'} and defined $capabilities{'value'};
      }
    }
  }
}

sub usableXML {
  my $cref = shift;
  my $content = $$cref; ## Don't change caller's content just for usability check

  preprocess(\$content);

  return 1 if isWURFL(\$content);

  return 0;
}

sub isWURFL {
  my $cref = shift;
  return scalar($$cref =~ /<wurfl.*?>.*<\/wurfl>/is);
}

sub xml_attributes_hash {
  my $tag = shift;
  my $cref = shift;

  my %result;
  $$cref =~ /<${tag}\s+(.*?)\/?>/is;
  my $result = $1;
  return undef if not defined $result;
  while ($result =~ s|(\w+)\s*=\s*["]([^"]*)["]||) {
    $result{$1} = $2;
  }
  while ($result =~ s|(\w+)\s*=\s*[']([^']*)[']||) {
    $result{$1} = $2;
  }
  return %result;
}

sub xml_content_array {
  my $tag = shift;
  my $cref = shift;
  my $keeptags = shift;
  $keeptags = 0 unless $keeptags;
  my @result;

  if ($keeptags) {
    @result = ($$cref =~ m{(<${tag}[^>]*/>)}gs); # finds all empty elements
    push(@result, $$cref =~ m{(<${tag}[^>]*(?:(?!/).)>(?:(?!</${tag}>).)*</${tag}>)}gsx);
  }
  else {
    @result = ($$cref =~ m~<${tag}[^>]*?/>~gs);
    push(@result, $$cref =~ m~<${tag}[^>]*?[^/]>(.*?)</${tag}>~gs);
  }

  return @result;
}

sub xml_content_string {
  my $tag = shift;
  my $cref = shift;

  $$cref =~ /<${tag}.*?>(.*)<\/${tag}>/is;
  return $1;
}

1;
