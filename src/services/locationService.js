// import Worker from '../models/Worker.js';

// // MongoDB $geoNear Aggregation to find nearby workers
// export const getNearbyWorkersFromDB = async (lng, lat, radiusInMeters, category) => {
//   const pipeline = [
//     {
//       $geoNear: {
//         near: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
//         distanceField: 'distance',
//         maxDistance: parseInt(radiusInMeters),
//         query: { isAvailable: true, kycStatus: 'approved' }, // Strictly active & verified workers
//         spherical: true
//       }
//     }
//   ];

//   // Agar customer ne koi specific category filter select ki hai (e.g., Electrician)
//   if (category) {
//     pipeline[0].$geoNear.query.serviceCategory = category;
//   }

//   // Execute geo query execution
//   const workers = await Worker.aggregate(pipeline);
  
//   // Distance ko meters se KM me convert karke send karenge compute field me
//   return workers.map(worker => ({
//     ...worker,
//     distanceInKm: parseFloat((worker.distance / 1000).toFixed(2)),
//     estimatedArrivalTimeMins: Math.ceil((worker.distance / 1000) * 3) // Simulating 3 mins per KM travel time
//   }));
// };

import Worker from '../models/Worker.js';

// MongoDB $geoNear Aggregation to find nearby workers
export const getNearbyWorkersFromDB = async (lng, lat, radiusInMeters, category) => {
  const pipeline = [
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
        distanceField: 'distance',
        maxDistance: parseInt(radiusInMeters),
        // DEVELOPMENT HACK: kycStatus ko remove/comment kiya taaki bina manual verification ke test ho sake
        query: { isAvailable: true }, 
        spherical: true
      }
    }
  ];

  // Agar customer ne koi specific category filter select ki hai (e.g., Electrician)
  if (category) {
    pipeline[0].$geoNear.query.serviceCategory = category;
  }

  // Execute geo query execution
  const workers = await Worker.aggregate(pipeline);
  
  // Distance ko meters se KM me convert karke send karenge compute field me
  return workers.map(worker => ({
    ...worker,
    distanceInKm: parseFloat((worker.distance / 1000).toFixed(2)),
    estimatedArrivalTimeMins: Math.ceil((worker.distance / 1000) * 3) // Simulating 3 mins per KM travel time
  }));
};