import { Model } from "mongoose";

export const paginateRecords = async <T>(
    model: Model<T>,
    filter: Record<string, any>,
    page: number,
    limit: number,
    sortOptions: any = { createdAt: -1 },
    populateOptions: any = null
) => {
    const skip = (page - 1) * limit;
    const total = await model.countDocuments(filter);
    
    let query = model.find(filter).sort(sortOptions).skip(skip).limit(limit);
    
    if (populateOptions) {
        query = query.populate(populateOptions);
    }
    
    const data = await query;
    
    return {
        data,
        total,
        page,
        limit
    };
};
