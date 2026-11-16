const Invoice = require('../models/Invoice');
const User = require('../models/User');
const Project = require('../models/Project');

exports.getInvoices = async (req, res, next) => {
  try {
    let query: any = {};
    if (req.user.role === 'client') {
      query.client = req.user.id;
    } else if (req.user.role === 'developer') {
      return res.json({ success: true, count: 0, invoices: [] });
    }

    const { status, search } = req.query;
    if (status && status !== 'All') {
      query.status = status;
    }

    const invoices = await Invoice.find(query)
      .populate('client', 'name email company')
      .populate('project', 'title')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: invoices.length, invoices });
  } catch (err) { next(err); }
};

exports.getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('client', 'name email company phone')
      .populate('project', 'title description');

    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

    if (req.user.role === 'client' && invoice.client._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, invoice });
  } catch (err) { next(err); }
};

exports.createInvoice = async (req, res, next) => {
  try {
    const { client, project, amount, dueDate, status, items, notes } = req.body;
    if (!client || !amount || !dueDate) {
      return res.status(400).json({ success: false, message: 'Client, amount, and due date are required' });
    }

    const count = await Invoice.countDocuments();
    const invoiceNumber = req.body.invoiceNumber || `INV-${String(count + 1).padStart(4, '0')}`;

    const invoice = await Invoice.create({
      invoiceNumber,
      client,
      project: project || null,
      amount: Number(amount),
      dueDate,
      status: status || 'Pending',
      items: items || [{ description: 'Professional Services', quantity: 1, rate: Number(amount), amount: Number(amount) }],
      notes: notes || 'Thank you for choosing ClientFlow.'
    });

    res.status(201).json({ success: true, invoice });
  } catch (err) { next(err); }
};

exports.updateInvoice = async (req, res, next) => {
  try {
    const { status, amount, dueDate, notes } = req.body;
    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (amount !== undefined) updateData.amount = Number(amount);
    if (dueDate !== undefined) updateData.dueDate = dueDate;
    if (notes !== undefined) updateData.notes = notes;

    const invoice = await Invoice.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.json({ success: true, invoice });
  } catch (err) { next(err); }
};

exports.deleteInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.json({ success: true, message: 'Invoice deleted' });
  } catch (err) { next(err); }
};
