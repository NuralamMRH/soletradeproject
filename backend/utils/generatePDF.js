const PDFDocument = require("pdfkit")
const QRCode = require("qrcode")
const fs = require("fs")
const { Inventory, User } = require("../models")
const { v4: uuidv4 } = require("uuid")
const path = require("path")
const generateQR = require("./generateQR")

async function generateOrderAcceptPDF(
  req,
  exportCTO,
  importerCTO,
  senderWarehouse,
  receiverWarehouse,
  buyerOrderRequest,
  senderManager,
  sellerAddress
) {
  // const user = await User.findById(req.user.id);
  const userFolder = `pdfs` // Define user-specific folder
  const schemaFolder = userFolder

  // Define the upload directory
  const uploadDir = "public/uploads"

  // Create the full path to the user folder
  const userFolderPath = path.join(uploadDir, schemaFolder)

  // Ensure the directory exists
  if (!fs.existsSync(userFolderPath)) {
    fs.mkdirSync(userFolderPath, { recursive: true })
  }
  const formattedQrCode = (qrCode) => {
    // Convert the qrCode format from "WA/2/PA/25/11/24/001" to "WA-2-PA-25-11-24-001"
    return qrCode?.replaceAll("/", "-")
  }
  // Generate filename
  const filename = `${formattedQrCode(exportCTO)}-${formattedQrCode(
    importerCTO
  )}${senderWarehouse.zip}-${receiverWarehouse.zip}.pdf`

  // Full file path
  const filePath = path.join(userFolderPath, filename)

  const doc = new PDFDocument()

  const vietnameseFontPath = path.join(__dirname, "fonts", "Roboto-Regular.ttf")

  // Register Vietnamese font
  doc.font(vietnameseFontPath)
  // Create and write the PDF to the path
  doc.pipe(fs.createWriteStream(filePath))

  // const exporterQR = await QRCode.toDataURL(req.body.exportCTO);
  const exporterQR = await generateQR(exportCTO)
  // console.log("exporterQR: ", exporterQR)
  // const importerQR = await QRCode.toDataURL(req.body.importerCTO);
  const importerQR = await generateQR(importerCTO)

  const qrSize = 80 // Adjust QR code size if necessary
  doc
    .image(exporterQR, doc.x, doc.y, { fit: [qrSize, qrSize] })
    .text("\n")
    .moveUp()
    .image(
      importerQR,
      doc.page.width - doc.page.margins.right - qrSize,
      doc.y,
      {
        fit: [qrSize, qrSize],
        align: "right",
      }
    )

  doc
    .fontSize(16)
    .text(`PO ${buyerOrderRequest.order_type} ORDER`, { align: "center" })
  doc
    .fontSize(10)
    .text(
      `${
        buyerOrderRequest.seller.name
          ? buyerOrderRequest.seller.name
          : `${senderManager.f_name} ${senderManager.l_name}`
      }`,
      {
        align: "center",
      }
    )
    .moveDown(0.2)
    .text(`${sellerAddress.address}`, {
      align: "center",
    })
    .text(
      `MOB: ${sellerAddress.contact_person_number || ""}   Email: ${
        sellerAddress.contact_person_email || ""
      }`,
      {
        align: "center",
      }
    )
    .text(`Zip: ${sellerAddress.zip}`, {
      align: "center",
    })

  doc.moveDown(1)

  // Transfer Order Title
  doc
    .moveDown(0.5)
    .fontSize(10)
    .text(
      `(With ${buyerOrderRequest.order_type} Delivery Note and VCNB - No.: - ${exportCTO} )`,
      {
        align: "center",
      }
    )

  doc.moveDown(1)

  // Date of Establishment
  doc
    .fontSize(10)
    .text(`Date of Establishment: ${new Date().toLocaleDateString()}`, {
      align: "left",
    })

  doc.moveDown(1)

  // Margins and column positions
  const leftColumnX = doc.page.margins.left // Left column starting position
  const rightColumnX = doc.page.width / 2 + 10 // Right column starting position
  const tableWidth =
    doc.page.width - doc.page.margins.left - doc.page.margins.right // Full table width
  const columnWidth = (tableWidth - 20) / 2 // Width of each column (divide table width into two)
  const rowHeight = 27 // Height of each table row

  // Function to draw table headers
  function drawTableHeader(doc, x, y, width, height, text) {
    doc
      .rect(x, y, width, height)
      .fillAndStroke("#fff0", "#fff0") // Light gray background and black border
      .fill("#333")
      .fontSize(10)
      .text(text, x + 5, y + 5, { width: width - 10, align: "center" })
  }

  // Function to draw table rows
  function drawTableRow(doc, x, y, width, height, text) {
    doc
      .rect(x, y, width, height)
      .stroke() // Black border
      .fill("#333")
      .fontSize(10)
      .text(text, x + 5, y + 5, { width: width - 10, align: "left" })
  }

  // Y position where the table starts
  let currentY = doc.y

  // Table headers
  drawTableHeader(doc, leftColumnX, currentY, columnWidth, rowHeight, "")
  drawTableHeader(doc, rightColumnX, currentY, columnWidth, rowHeight, "")

  currentY += rowHeight // Move to the next row

  // Table rows for Exporter and Importer
  const tableRows = [
    {
      exporter: `Exporter: ${senderWarehouse.contact_person_name}`,
      importer: `Importer: ${receiverWarehouse.contact_person_name}`,
    },
    {
      exporter: `Export ID: ${exportCTO}`,
      importer: `Import ID: ${importerCTO}`,
    },
    {
      exporter: `Export ${senderWarehouse.address_type
        .slice(0, 1)
        .toUpperCase()}: ${senderWarehouse.address}`,
      importer: `Import ${receiverWarehouse.address_type
        .slice(0, 1)
        .toUpperCase()}: ${receiverWarehouse.address}`,
    },
    {
      exporter: `TruckID: ${req.body.truckId ? req.body.truckId : ""}`,
      importer: `Tracking Company: ${
        req.body.trackingCompany ? req.body.trackingCompany : ""
      }`,
    },
    {
      exporter: `Route From: ${senderWarehouse.zip ? senderWarehouse.zip : ""}`,
      importer: `Route To: ${
        receiverWarehouse.zip ? receiverWarehouse.zip : ""
      }`,
    },
    {
      exporter: `Export Time: ${
        req.body.exportAt ? `${formatDate(req.body.exportAt)}` : ""
      }`,
      importer: `Arrival Time: ${
        req.body.arrivalAt ? `${formatDate(req.body.arrivalAt)}` : ""
      }`,
    },
  ]

  // Draw each row
  tableRows.forEach((row) => {
    drawTableRow(
      doc,
      leftColumnX,
      currentY,
      columnWidth,
      rowHeight,
      row.exporter
    )
    drawTableRow(
      doc,
      rightColumnX,
      currentY,
      columnWidth,
      rowHeight,
      row.importer
    )
    currentY += rowHeight // Move to the next row
  })

  doc.moveDown(3).text("", { align: "left", width: doc.page.width })

  // Footer Section
  doc
    .fontSize(10)
    .text("Interpretation: Agribbee, Contract No.: XXXXXXX", { align: "left" })
    .moveDown(0.5)
    .text(
      `VCNB voucher to ${receiverWarehouse.contact_person_name} unit from ${senderWarehouse.contact_person_name}`,
      { align: "left" }
    )

  doc.moveDown(1)
  doc.text("Inspection Condition: New", { align: "left" })
  doc.text(`Application number: ${exportCTO}`, { align: "left" })

  doc.end()

  // Construct the file's public URL
  const fileFullUrl = `${
    process.env.BASE_URL || `http://localhost:${process.env.PORT}`
  }/public/uploads/${schemaFolder}/${filename}`.replace(/\\/g, "/")

  return fileFullUrl
}

async function generateProductListPDF(req, orderDetails) {
  const { products, billing, subtotal, shipping, total } = orderDetails

  // Create directories
  const uploadDir = "public/uploads"
  const schemaFolder = "pdfs"
  const userFolderPath = path.join(uploadDir, schemaFolder)

  if (!fs.existsSync(userFolderPath)) {
    fs.mkdirSync(userFolderPath, { recursive: true })
  }

  const filename = `order_${uuidv4()}.pdf`
  const filePath = path.join(userFolderPath, filename)

  const doc = new PDFDocument({ size: "A4", margin: 50 })
  doc.pipe(fs.createWriteStream(filePath))

  // Title Section
  doc
    .fontSize(16)
    .text("Order Invoice", { align: "center", underline: true })
    .moveDown(1)

  // Billing Address
  doc.fontSize(10).text(`Importer Info:`).moveDown(0.5)
  doc
    .text(`Name: ${billing.contact_person_name}`)
    .text(`Email: ${billing.contact_person_email}`)
    .text(`Phone: ${billing.contact_person_number}`)
    .text(
      `${billing?.address_type}: ${billing.address}, ${billing.city.name}, ZIP: ${billing.zip}`
    )
    .text(`Country: ${billing.country.countryCode}`)
    .text(`Payment status: ${orderDetails?.payment_status}`)
    .text(`Payment Method: ${req.body.payment_method}`)
    .moveDown(1)

  // Billing Address
  doc.fontSize(10).text(`Exporter Info:`).moveDown(0.5)
  doc
    .text(`Name: ${req.body?.sourcer_name}`)
    .text(`Sourcer Id: ${req.body?.sourcer_id}`)
    .text(`Sourcer status: Pending`)
    .moveDown(1)

  // Table Header
  const startX = 50
  const colWidths = [40, 100, 100, 60, 80, 80] // Define column widths
  const tableStartY = doc.y

  doc
    .fontSize(10)
    .text("No", startX, tableStartY, { width: colWidths[0], align: "center" })
    .text("Product Name", startX + colWidths[0], tableStartY, {
      width: colWidths[1],
      align: "left",
    })
    .text("Barcode", startX + colWidths[0] + colWidths[1], tableStartY, {
      width: colWidths[2],
      align: "center",
    })
    .text(
      "Quantity",
      startX + colWidths[0] + colWidths[1] + colWidths[2],
      tableStartY,
      {
        width: colWidths[3],
        align: "center",
      }
    )
    .text(
      "Price",
      startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3],
      tableStartY,
      {
        width: colWidths[4],
        align: "right",
      }
    )
    .text(
      "Subtotal",
      startX +
        colWidths[0] +
        colWidths[1] +
        colWidths[2] +
        colWidths[3] +
        colWidths[4],
      tableStartY,
      { width: colWidths[5], align: "right" }
    )

  // Horizontal line below header
  doc
    .moveTo(startX, tableStartY + 15)
    .lineTo(
      startX + colWidths.reduce((sum, width) => sum + width, 0),
      tableStartY + 15
    )
    .stroke()

  // Render Table Rows
  let rowY = tableStartY + 20
  products.forEach((product, index) => {
    const subtotal = product.quantity * product.price
    doc
      .fontSize(10)
      .text(index + 1, startX, rowY, { width: colWidths[0], align: "center" })
      .text(product.name, startX + colWidths[0], rowY, {
        width: colWidths[1],
        align: "left",
      })
      .fontSize(7.5)
      .text(product.id, startX + colWidths[0] + colWidths[1], rowY, {
        width: colWidths[2],
        align: "center",
      })
      .text(
        product.quantity,
        startX + colWidths[0] + colWidths[1] + colWidths[2],
        rowY,
        {
          width: colWidths[3],
          align: "center",
        }
      )
      .fontSize(10)
      .text(
        `${product.price.toLocaleString()} VND`,
        startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3],
        rowY,
        {
          width: colWidths[4],
          align: "right",
        }
      )
      .text(
        `${subtotal.toLocaleString()} VND`,
        startX +
          colWidths[0] +
          colWidths[1] +
          colWidths[2] +
          colWidths[3] +
          colWidths[4],
        rowY,
        { width: colWidths[5], align: "right" }
      )

    rowY += 20

    // Add page break if necessary
    if (rowY > doc.page.height - 50) {
      doc.addPage()
      rowY = 50
    }
  })

  // Order Summary Section

  doc.moveDown(2)
  const summaryStartY = doc.y
  const summaryLabels = ["Subtotal", "Shipping", "Total"]
  const summaryValues = [
    `${subtotal?.toLocaleString()} VND`,
    `${req.body.delivery ? req.body.delivery?.toLocaleString() : "0000"} VND`,
    `${total?.toLocaleString()} VND`,
  ]

  summaryLabels.forEach((label, idx) => {
    doc
      .fontSize(11)
      .text(label, startX, summaryStartY + idx * 20, {
        width: colWidths.slice(0, 5).reduce((sum, width) => sum + width, 0),
        align: "left",
      })
      .text(
        summaryValues[idx],
        startX + colWidths.slice(0, 5).reduce((sum, width) => sum + width, 0),
        summaryStartY + idx * 20,
        { width: colWidths[5], align: "right" }
      )
  })
  // Render Table Rows

  // Footer
  doc.moveDown(2).fontSize(10).text("Generated Date:", { align: "left" })
  doc.text(new Date().toLocaleDateString(), { align: "left" })

  // Finalize PDF
  doc.end()

  // Return the public file URL
  const fileFullUrl = `${
    process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`
  }/public/uploads/${schemaFolder}/${filename}`.replace(/\\/g, "/")

  return fileFullUrl
}

async function generateWarehousePDF(
  req,
  exportCTO,
  importerCTO,
  senderWarehouse,
  receiverWarehouse
) {
  // const user = await User.findById(req.user.id);
  const userFolder = `pdfs` // Define user-specific folder
  const schemaFolder = userFolder

  // Define the upload directory
  const uploadDir = "public/uploads"

  // Create the full path to the user folder
  const userFolderPath = path.join(uploadDir, schemaFolder)

  // Ensure the directory exists
  if (!fs.existsSync(userFolderPath)) {
    fs.mkdirSync(userFolderPath, { recursive: true })
  }

  // Generate filename
  const filename = `transfer_order_${exportCTO}.pdf`

  // Full file path
  const filePath = path.join(userFolderPath, filename)

  const doc = new PDFDocument()

  // Create and write the PDF to the path
  doc.pipe(fs.createWriteStream(filePath))

  // const exporterQR = await QRCode.toDataURL(req.body.exportCTO);
  const exporterQR = await QRCode.toDataURL(exportCTO)
  // const importerQR = await QRCode.toDataURL(req.body.importerCTO);
  const importerQR = await QRCode.toDataURL(importerCTO)

  const qrSize = 100 // Adjust QR code size if necessary
  doc
    .image(exporterQR, doc.x, doc.y, { fit: [qrSize, qrSize] })
    .text("\n")
    .moveUp()
    .image(
      importerQR,
      doc.page.width - doc.page.margins.right - qrSize,
      doc.y,
      {
        fit: [qrSize, qrSize],
        align: "right",
      }
    )

  doc.fontSize(16).text("WAREHOUSE TRANSFER ORDER", { align: "center" })
  doc
    .fontSize(10)
    .text("Ho Chi Minh City Book Distribution Joint Stock Company", {
      align: "center",
    })
    .moveDown(0.2)
    .text("60-62 Le Loi, Ben Nghe Ward, District 1, HCMC", {
      align: "center",
    })
    .text("Tel: (028) 3.8225.446    Fax: (028) 3.8225.795", {
      align: "center",
    })
    .text("MST: 0304132047", { align: "center" })

  doc.moveDown(1)

  // Transfer Order Title
  doc
    .moveDown(0.5)
    .fontSize(10)
    .text("(With Warehouse Delivery Note and VCNB - No.: - Symbol: )", {
      align: "center",
    })

  doc.moveDown(1)

  // Date of Establishment
  doc
    .fontSize(12)
    .text(`Date of Establishment: ${new Date().toLocaleDateString()}`, {
      align: "right",
    })

  doc.moveDown(1)

  // Export and Import Details
  doc.fontSize(12).text(`Sender W: ${senderWarehouse.name}`)
  doc.text(`Export CT number: ${exportCTO}`)
  doc.text(`Export warehouse: ${senderWarehouse.location.address}`)
  doc.text("\n")
  doc.text(`Recipient W: ${receiverWarehouse.name}`)
  doc.text(`Imported CT number: ${importerCTO}`)
  doc.text(`Import warehouse: ${receiverWarehouse.location.address}`)

  doc.moveDown(6)

  // Footer Section
  doc
    .fontSize(10)
    .text(
      "Interpretation: Science and Technology Joint Stock Company, Contract No.: XXXXXXX",
      { align: "left" }
    )
    .moveDown(0.5)
    .text(
      `VCNB voucher to ${receiverWarehouse.name} unit from ${senderWarehouse.name}`,
      { align: "left" }
    )

  doc.moveDown(1)
  doc.text("Inspection Condition: New", { align: "left" })
  doc.text("Application number: ___________", { align: "left" })

  doc.end()

  // Construct the file's public URL
  const fileFullUrl = `${
    process.env.BASE_URL || `http://localhost:${process.env.PORT}`
  }/public/uploads/${schemaFolder}/${filename}`.replace(/\\/g, "/")

  return fileFullUrl
}

async function generateWarehouseProductListPDF(req, inventories) {
  const language = req.headers["x-localization"] || "vi"

  // const user = await User.findById(req.user.id);
  const userFolder = `pdfs`
  const schemaFolder = userFolder

  const uploadDir = "public/uploads"
  const userFolderPath = path.join(uploadDir, schemaFolder)

  // Ensure the directory exists
  if (!fs.existsSync(userFolderPath)) {
    fs.mkdirSync(userFolderPath, { recursive: true })
  }

  const filename = `product_list_${uuidv4()}.pdf`
  const filePath = path.join(userFolderPath, filename)

  const doc = new PDFDocument()
  doc.pipe(fs.createWriteStream(filePath))

  // Header Section
  // Header Section
  doc
    .fontSize(10)
    .text("Supplier: R2D SCIENCE AND TECHNOLOGY COMPANY", { align: "center" })
    .moveDown(0.2)
    .text("Address: 14 DC3, Son Ky Ward, Tan Phu District, Ho Chi Minh City", {
      align: "center",
    })
    .moveDown(0.2)
    .text(
      "Ordering Party: Phu Nhuan Book Center - FAHASA HO CHI MINH CITY BOOK PUBLISHING JOINT STOCK COMPANY",
      { align: "center" }
    )
    .moveDown(0.2)
    .text("Address: 364 Truong Chinh, Ward 13, Tan Binh District, HCMC", {
      align: "center",
    })
    .moveDown(0.5)

  // Title Section
  doc.fontSize(16).text("TRANSFER PRODUCT LIST", { align: "center" })
  doc.moveDown(1)

  // Add Table Header with Absolute Positioning
  const startX = 50 // Starting X-coordinate for the table
  const startY = doc.y // Capture the current Y-coordinate for the header row
  const colWidths = [50, 150, 250, 100] // Define column widths for alignment

  doc
    .fontSize(12)
    .text("No", startX, startY, { width: colWidths[0], align: "center" })
    .text("Barcode", startX + colWidths[0], startY, {
      width: colWidths[1],
      align: "center",
    })
    .text("Product Name", startX + colWidths[0] + colWidths[1], startY, {
      width: colWidths[2],
      align: "center",
    })
    .text(
      "Quantity",
      startX + colWidths[0] + colWidths[1] + colWidths[2],
      startY,
      {
        width: colWidths[3],
        align: "center",
      }
    )

  // Draw a horizontal line under the header
  doc.moveDown(0.5).strokeColor("#000").lineWidth(1)
  doc
    .moveTo(startX, startY + 20) // Line starts below the header row
    .lineTo(
      startX + colWidths.reduce((sum, width) => sum + width, 0),
      startY + 20
    )
    .stroke()

  doc.moveDown(1) // Add spacing before the inventory rows

  // Add Inventory Details with Absolute Positioning
  let rowY = startY + 25 // Start below the header (adjust for line height)
  let index = 0

  for (const item of inventories) {
    const inventoryData = await Inventory.findById(item.inventory).populate(
      "product"
    )

    if (!inventoryData) {
      continue // Skip if inventory data is not found
    }

    const productName =
      inventoryData.product?.[language]?.name ||
      inventoryData.product?.name ||
      inventoryData.product?._id

    const barcodeOrSlug =
      inventoryData.product?.barcode || inventoryData.product?.slug || "N/A"

    // Render each row with precise alignment
    doc
      .fontSize(10)
      .text(index + 1, startX, rowY, { width: colWidths[0], align: "center" })
      .text(barcodeOrSlug, startX + colWidths[0], rowY, {
        width: colWidths[1],
        align: "center",
      })
      .text(productName, startX + colWidths[0] + colWidths[1], rowY, {
        width: colWidths[2],
        align: "center",
      })
      .text(
        item.quantity,
        startX + colWidths[0] + colWidths[1] + colWidths[2],
        rowY,
        {
          width: colWidths[3],
          align: "center",
        }
      )

    // Move to the next row
    rowY += 20 // Adjust row spacing (20 is typical for single-line rows)
    index++

    // Page break logic (if needed)
    if (rowY > doc.page.height - 50) {
      doc.addPage()
      rowY = 50 // Reset Y-position for new page
    }
  }

  doc.moveDown(1)

  doc
    .text("Date", { align: "left" })
    .moveDown(0.5)
    .text(new Date().toLocaleDateString(), {
      align: "left",
      width: colWidths[2],
    })

  doc.end()

  // Construct the file's public URL
  const fileFullUrl = `${
    process.env.BASE_URL || `http://localhost:${process.env.PORT}`
  }/public/uploads/${schemaFolder}/${filename}`.replace(/\\/g, "/")

  return fileFullUrl
}

module.exports = {
  generateOrderAcceptPDF,
  generateProductListPDF,
  generateWarehousePDF,
  generateWarehouseProductListPDF,
}

const formatDate = (dateString) => {
  if (!dateString) return ""
  const date = new Date(dateString)
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}
