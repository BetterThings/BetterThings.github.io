osm_mep
=======

MobileSiteOS adaptation of MediaElementPlayer

These files make up MobileSiteOS' version of a responsive designed, HTML5 video and audio player. They are a derivation of the MediaElement and MediaElementPlayer scripts, as created by John Dyer (One file. Any browser, Same UI: http://mediaelementjs.com/). The original version of these files can be found at https://github.com/johndyer/mediaelement/.

Our files are of reduced size and are a highly modified version of the originals, with MobileSiteOS debugging and module loading added. Independent modules means only the files needed for any particular device, capability and set of pre-configured features are loaded in order to play the specified source video or audio files.

It is important to note that we don't make any attempt to have these scripts work for IE6, 7 or 8. As of this writing, they are also untested in IE9, 10. Since we have already moved to jQuery v2, these scripts are intended more specifically for mobile applications.
