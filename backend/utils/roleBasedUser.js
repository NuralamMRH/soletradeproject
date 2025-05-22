exports.roleBasedUser = async (user, roleType, Model, data) => {
  // Check if user role matches the given roleType
  if (user.role === roleType) {
    // Create the entity for the user with the given Model
    const result = await Model.create({
      ...data,
      user: user._id, // This assumes the role entity is related to the user
    });

    // Link the created result (store/delivery etc.) to the user
    user[roleType] = result._id;
    await user.save();

    return result;
  }
  return null;
};
