import axios from 'axios';
import { Vehicle } from '../models/models.js';

const headers = {
  'x-api-key': process.env.DVLA_KEY,
  'Content-Type': 'application/json',
};

export const createVehicle = async (req, res) => {
  const { registrationNumber, numOfKm } = req.body;

  try {
    let vehicle = await Vehicle.findOne({
      where: { registrationNumber: registrationNumber },
    });

    if (vehicle) {
      // Vehicle exists in our database, retrieve CO2 emissions
      const {
        co2Emissions,
        make,
        fuelType,
        wheelplan,
        colour,
        monthOfFirstRegistration,
        taxStatus,
      } = vehicle;

      const totalCO2Emissions = co2Emissions * numOfKm;
      res
        .status(200)
        .json({
          totalCO2Emissions,
          make,
          fuelType,
          wheelplan,
          colour,
          monthOfFirstRegistration,
          taxStatus,
          message: 'Retrieve Co2 Emissions',
        });
    } else {
      // Vehicle doesn't exist in our database, make the DVLA API call
      const url = `${process.env.DVLA_URL}/vehicles`;

      const response = await axios.post(
        url,
        { registrationNumber },
        { headers }
      );

      // Handle the DVLA API response data and store it in the database
      const co2Emissions = response.data.co2Emissions;
      vehicle = await Vehicle.create({ registrationNumber, co2Emissions });

      const totalCO2Emissions = co2Emissions * numOfKm;
      res.status(200).json({ totalCO2Emissions });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
