import { fileUpload } from '../Helpers'

export const uploadService = {
  uploadImage: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return fileUpload({ url: 'upload/uploadImage', cred: formData })
  },
}
