const QRCode = require("qrcode")
const { Jimp } = require("jimp")
const { JimpMime } = require("jimp")

const configSchema = require("../models/config/config")
// const { Config } = require("../models")

async function generateQR(qrCode) {
  const Config = await configSchema()
  let config = await Config.findOne()
  if (!config.logo || !config.logo_full_url) {
    throw new Error("Config logo not found")
  }

  // Generate QR Code as a buffer
  const qrCodeDataURL = await QRCode.toDataURL(qrCode, {
    errorCorrectionLevel: "H", // High error correction level (30% redundancy)
    margin: 2, // Add margin to QR code
    scale: 10, // Ensures higher resolution QR code
  })
  const qrCodeImage = await Jimp.read(
    Buffer.from(qrCodeDataURL.split(",")[1], "base64")
  )

  // Load the logo image
  const logo = await Jimp.read(config.logo_full_url)

  // Resize the logo to fit in the center of the QR code
  const qrCodeWidth = qrCodeImage.bitmap.width
  const logoWidth = qrCodeWidth / 5 // Adjust size (1/4 of QR code size)
  console.log("Logo Dimensions:", logo.bitmap.width, logo.bitmap.height)

  console.log("Resizing logo to:", logoWidth)

  const AUTO = Jimp.AUTO || -1 // Safely fallback for AUTO
  //   logo.resize(10, 10)
  logo.resize({ w: logoWidth, AUTO })
  console.log("Logo resized successfully")

  const logoWithBackground = new Jimp({
    width: logoWidth,
    height: logoWidth,
    color: 0xffffffff,
  })

  logoWithBackground.composite(logo, 0, 0)

  // Calculate the position to place the logo
  const x = (qrCodeWidth - logoWithBackground.bitmap.width) / 2
  const y = (qrCodeWidth - logoWithBackground.bitmap.height) / 2

  // Composite the logo onto the QR code
  qrCodeImage.composite(logoWithBackground, x, y, {
    mode: Jimp.BLEND_SOURCE_OVER,
    opacitySource: 1,
    opacityDest: 1,
  })

  // Convert the final image to a DataURL
  return await qrCodeImage.getBuffer(JimpMime.jpeg)
}

module.exports = generateQR
