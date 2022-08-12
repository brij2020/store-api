const multer = require('multer');
const path = require('path')


const storage = multer.diskStorage({
	destination(req, file, cb) {
		cb(null, 'uploads/')
	},
	filename(req, file, cb) {
		cb(
			null,
			// Set file name to
			// filename-Date.now().extension
			`${file.fieldname}-${new Date().getMilliseconds()}-${path.extname(file.originalname)}`
		)
	},
})

function checkFileType(file, cb) {
	// Accepted file types
	const filetypes = /jpg|jpeg|png/

	// Check if upload file type matches with accepted file types
	const extName = filetypes.test(
		path.extname(file.originalname).toLocaleLowerCase()
	)

	const mimetype = filetypes.test(file.mimetype)
	if (extName && mimetype) {
		return cb(null, true)
	} else {
		cb('Images only!')
	}
}

const upload = multer({
	storage,
})

const uploadDB = upload.single('studant')
module.exports = {
    uploadDB
}