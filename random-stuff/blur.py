# Testing GaussianBlur filter from PIL library

from PIL import Image, ImageFilter

def blur_image(image_path, output_path):
    image = Image.open(image_path)
    blurred_image = image.filter(ImageFilter.GaussianBlur(radius=10))
    blurred_image.save(output_path)

if __name__ == "__main__":
    blur_image("../assets/messi.jpg", "../assets/messi-blurred.jpg")