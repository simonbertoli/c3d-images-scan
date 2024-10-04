# Cornerstone Length/Measurement Tools & Ultrasound Images

This is a demonstration to troubleshoot the Cornerstone Scroll tool, which fails to retain Pan adjustments when loading multiple files and scrolling between them.

## To build

1. Check out repo
2. `npm install`
3. `cd mult-uploads`
4. `npm run serve`

Once running, load all the files in `test-files`.

To replicate the issue, load all the files then select the PAN tool. Move the image, then select the **MouseWheel Image Flick** button to scroll through the images. The Pan co-ordinates only seem to hold for the first image scrolled to before resetting.
