function generateSVG() {
  const numberInput = document.getElementById('numberInput').value;
  const svgdbURL = `https://svgdb.me/assets/fullart/${numberInput}.png`;

  // Create an image element and set the src attribute to the generated SVGDB URL
  const imageElement = document.createElement('img');

  // Add an event listener to check if the image loaded successfully
  imageElement.addEventListener('load', function() {
    // Clear the previous image (if any) and add the new image to the container
    const imageContainer = document.getElementById('imageContainer');
    imageContainer.innerHTML = '';
    imageContainer.appendChild(imageElement);
  });

  // Add an event listener to check for errors while loading the image
  imageElement.addEventListener('error', function() {
    // Clear the previous image (if any)
    const imageContainer = document.getElementById('imageContainer');
    imageContainer.innerHTML = '';

    // Display error message
    const errorMessage = document.createElement('p');
    errorMessage.textContent = '未找到对应图片，请输入正确的数字。';
    imageContainer.appendChild(errorMessage);
  });

  // Set the src attribute to the SVGDB URL
  imageElement.src = svgdbURL;
}
