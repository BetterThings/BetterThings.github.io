// Page specific js code

/*global
    msos: false,
    jQuery: false
*/

msos.provide("demo.packery.imageload");
msos.require("jquery.tools.packery");
msos.require("jquery.tools.imagesloaded");


msos.onload_functions.push(
    function () {
        "use strict";

        msos.console.info('Content: imageload.html loaded!');

        var demo = document.querySelector('#img_loading_demo'),
            container = demo.querySelector('#image-container'),
            progressElem = demo.querySelector('progress'),
            statusElem = demo.querySelector('#status'),
            supportsProgress = progressElem && progressElem.toString().indexOf('Unknown') === -1,
            textSetter = document.documentElement.textContent !== undefined ? 'textContent' : 'innerText',
            loadedImageCount,
            imageCount;

        function getImageItem() {
            var item = document.createElement('li'),
                img = document.createElement('img'),
                size = Math.random() * 3 + 1,
                width = Math.random() * 110 + 100,
                height = Math.round(140 * size),
                rando = Math.ceil(Math.random() * 1000);

            item.className = 'is-loading';
            width = Math.round(width * size);

            // 10% chance of broken image src
            // random parameter to prevent cached images
            img.src = rando < 100
                ? '//foo/broken-' + rando + '.jpg'
                : '//lorempixel.com/' + width + '/' + height + '/' + '?' + rando;

            item.appendChild(img);

            return item;
        }

        function getItemsFragment() {
            var fragment = document.createDocumentFragment(),
                i = 0,
                item;

            for (i = 0; i < 7; i += 1) {
                item = getImageItem();
                fragment.appendChild(item);
            }
            return fragment;
        }

        function setText(elem, value) {
            elem[textSetter] = value;
        }

        function updateProgress(value) {
            if (supportsProgress) {
                progressElem.setAttribute('value', value);
            } else {
                // if you don't support progress elem
                setText(statusElem, value + ' / ' + imageCount);
            }
        }

        function onProgress(imgLoad, image) {
            // change class if the image is loaded or broken
            image.img.parentNode.className = image.isLoaded ? '' : 'is-broken';
            // update progress element
            loadedImageCount += 1;
            updateProgress(loadedImageCount);
        }

        function onAlways() {
            statusElem.style.opacity = 0;
        }

        function resetProgress() {
            statusElem.style.opacity = 1;
            loadedImageCount = 0;
            if (supportsProgress) {
                progressElem.setAttribute('max', imageCount);
            }
        }

        function empty(elem) {
            while (elem.firstChild) {
                elem.removeChild(elem.firstChild);
            }
        }

        demo.querySelector('#add').onclick = function () {

            var fragment = getItemsFragment(),
                imgLoad;

            container.insertBefore(fragment, container.firstChild);

            // Use ImagesLoaded
            imgLoad = imagesLoaded(container);

            imgLoad.on('progress',  onProgress);
            imgLoad.on('always',    onAlways);

            // reset progress counter
            imageCount = imgLoad.images.length;
            resetProgress();
            updateProgress(0);
        };

        // reset container
        document.querySelector('#reset').onclick = function () {
            empty(container);
        };
    }
);