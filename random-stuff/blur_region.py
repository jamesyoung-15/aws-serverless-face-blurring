# Testing GaussianBlur filter from PIL library

from PIL import Image, ImageFilter

def blur_image_region(image_path, output_path, region):
    """ 
    Args:
        image_path (str): Path to the image file
        output_path (str): Path to save the modified image
        region (tuple): Coordinates of the region to blur (left, upper, right, lower)

    """
    image = Image.open(image_path)

    box = region  # (left, upper, right, lower)

    # Crop the region from the original image
    region_to_blur = image.crop(box)

    # region_to_blur.show()

    # Apply Gaussian blur to the cropped region
    blurred_region = region_to_blur.filter(ImageFilter.GaussianBlur(radius=12))  # Adjust radius as needed

    # Paste the blurred region back into the original image
    image.paste(blurred_region, box)

    image.show()

    # Save the modified image
    # image.save(output_path)


if __name__ == "__main__":
    blur_image_region("../media/messi.jpg", "../media/messi-blurred.jpg", (155, 30, 245, 145))