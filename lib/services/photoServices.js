const googleMapsClient = require("@google/maps").createClient({
  key: process.env.GOOGLE_PLACES_API_KEY,
})
const util = require("util")
const findPlace = util.promisify(googleMapsClient.findPlace)
const place = util.promisify(googleMapsClient.place)
const placesPhoto = util.promisify(googleMapsClient.placesPhoto)

const randomElement = (arr) => {
  if (!arr || !arr.length) return null
  return arr[Math.floor(Math.random() * arr.length)]
}

const getPlaceIdForTextQuery = async (inputString) => {
  console.log(`Looking up ${inputString}`)
  const result = await findPlace({ input: inputString, inputtype: "textquery" })
  if (result.status !== 200) {
    throw new Error(`Invalid response code ${result.status}`)
  } else if (
    !result.json ||
    !result.json.candidates ||
    !result.json.candidates.length
  ) {
    throw new Error(`Could not find anything for ${inputString}`)
  }

  return result.json.candidates[0].place_id // could do something if there are multiple candidates
}

const getPhotoReferenceForPlaceId = async (placeId) => {
  console.log(`getting photos for place id ${placeId}`)
  const photosResponse = await place({
    placeid: placeId,
    fields: ["photo"],
  })
  if (photosResponse.status !== 200) {
    throw new Error(`Invalid response code ${photosResponse.status}`)
  } else if (
    !photosResponse.json ||
    !photosResponse.json.result ||
    !photosResponse.json.result.photos ||
    !photosResponse.json.result.photos.length
  ) {
    throw new Error(`Could not find photos for ${placeId}`)
  }

  return randomElement(photosResponse.json.result.photos).photo_reference
}

const getPhotoUrlForReference = async (photoReference, maxWidth) => {
  console.log(`getting photo for reference ${photoReference}`)
  const photoResult = await placesPhoto({
    photoreference: photoReference,
    maxwidth: maxWidth,
  })

  if (photoResult.status !== 200) {
    throw new Error(`Invalid response code ${photoResult.status}`)
  }

  return "https://" + photoResult.req.socket._host + photoResult.req.path
}

const getPhotoForCity = async (city) => {
  const placeId = await getPlaceIdForTextQuery(city)
  const selectedPhotoReference = await getPhotoReferenceForPlaceId(placeId)
  return await getPhotoUrlForReference(selectedPhotoReference)
}

module.exports = {
  getPhotoForCity,
}
