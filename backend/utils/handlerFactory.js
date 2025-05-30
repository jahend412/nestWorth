import catchAsync from "./catchAsync.js";
import AppError from "./appError.js";

// Get All
export const getAll = (Model, popOptions = {}) => {
  return catchAsync(async (req, res, _next) => {
    // Apply user filter for user-owned resources
    const filter = req.user ? { userId: req.user.id, isActive: true } : {};

    const docs = await Model.findAll({
      where: filter,
      ...popOptions,
      order: [["createdAt", "DESC"]],
    });

    const modelName = Model.name.toLowerCase();

    res.status(200).json({
      status: "success",
      results: docs.length,
      data: { [modelName + "s"]: docs },
    });
  });
};

// Get One
export const getOne = (Model, popOptions = {}) => {
  return catchAsync(async (req, res, next) => {
    const filter = req.user
      ? { id: req.params.id, userId: req.user.id }
      : { id: req.params.id };

    const doc = await Model.findOne({
      where: filter,
      ...popOptions,
    });

    if (!doc) {
      return next(
        new AppError(`No ${Model.name.toLowerCase()} found with that ID`, 404)
      );
    }

    const modelName = Model.name.toLowerCase();

    res.status(200).json({
      status: "success",
      data: { [modelName]: doc },
    });
  });
};

// Create One
export const createOne = (Model, popOptions = {}) => {
  return catchAsync(async (req, res, _next) => {
    // Automatically add userId for user-owned resources
    const docData = req.user ? { ...req.body, userId: req.user.id } : req.body;

    const newDoc = await Model.create(docData);

    // Fetch complete document with associations
    const doc = await Model.findByPk(newDoc.id, popOptions);

    const modelName = Model.name.toLowerCase();

    res.status(201).json({
      status: "success",
      data: { [modelName]: doc },
    });
  });
};

// Update One
export const updateOne = (Model, popOptions = {}) => {
  return catchAsync(async (req, res, next) => {
    const filter = req.user
      ? { id: req.params.id, userId: req.user.id }
      : { id: req.params.id };

    const doc = await Model.findOne({ where: filter });

    if (!doc) {
      return next(
        new AppError(`No ${Model.name.toLowerCase()} found with that ID`, 404)
      );
    }

    await doc.update(req.body);

    // Fetch updated document with associations
    const updatedDoc = await Model.findByPk(doc.id, popOptions);

    const modelName = Model.name.toLowerCase();

    res.status(200).json({
      status: "success",
      data: { [modelName]: updatedDoc },
    });
  });
};

// Delete One
export const deleteOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const filter = req.user
      ? { id: req.params.id, userId: req.user.id }
      : { id: req.params.id };

    const doc = await Model.findOne({ where: filter });

    if (!doc) {
      return next(
        new AppError(`No ${Model.name.toLowerCase()} found with that ID`, 404)
      );
    }

    // Soft delete by setting isActive to false
    await doc.update({ isActive: false });

    res.status(204).json({
      status: "success",
      data: null,
    });
  });
};
