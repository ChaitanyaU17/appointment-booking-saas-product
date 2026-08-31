import { Request, Response } from 'express';
import Appointment from '../models/Appointment';

export const getCustomerAppointments = async (req: Request, res: Response): Promise<any> => {
  try {
    const user = (req as any).user;
    
    const appointments = await Appointment.find({
      $or: [
        { customerEmail: user.email },
        { customerId: user._id }
      ]
    }).populate('businessId', 'name slug logo').sort({ startTime: 1 });

    res.json(appointments);
  } catch (error) {
    console.error('Error fetching customer appointments:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const cancelAppointment = async (req: Request, res: Response): Promise<any> => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    const appointment = await Appointment.findOne({
      _id: id,
      $or: [
        { customerEmail: user.email },
        { customerId: user._id }
      ]
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.status === 'Completed' || appointment.status === 'Cancelled') {
      return res.status(400).json({ message: `Cannot cancel an appointment that is already ${appointment.status.toLowerCase()}` });
    }

    appointment.status = 'Cancelled' as any;
    await appointment.save();
    
    await appointment.populate('businessId', 'name slug logo');

    res.json(appointment);
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
