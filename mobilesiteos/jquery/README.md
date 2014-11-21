osm_jquery
==========

jQuery and jQuery-UI (github.com/jquery) as used in MobileSiteOS

The current and development (if any) copies of jQuery and jQuery-UI currently being used by MobileSiteOS. We use the standard jQuery script code, but use a subset of jQuery-UI (a custom build, although standard code). We however rename them by version.

Our custom jQuery-UI script includes:

1. All UI Core
2. Draggable Interaction
3. Effects Core

Most, if not all of the files in subfolders, are standard jQuery-UI or third party jQuery plugins which are only different in that MobileSiteOS module code has been added for "on-demand" loading. CSS files are typically standard, except they are broken down by individual widget or function for "on-demand" loading too. Thus all these files depend on MobileSiteOS to run correctly, which is kind of the point for them being here.

There may be some exceptions in subfolder files however, which were updated for MobileSiteOS use with commenting and debugging code, etc. We also try to remove redundent code which MobileSiteOS either doesn't need or already does in our base code. Searching for 'jquery.' or 'msos.' in these files will typically show which sections have been modified for MobileSiteOS use.
