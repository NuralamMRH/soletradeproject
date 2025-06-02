import MainApi from "../../api/MainApi";

export interface Poster {
  _id: string;
  image?: string;
  image_full_url?: string;
  [key: string]: any;
}

export const PosterApi = {
  // Get all posters
  getPosters: async (): Promise<{ data: Poster[] }> => {
    const res = await MainApi.get<{ data: Poster[] }>(`/api/v1/posters`);
    return res.data;
  },

  // Get poster by ID
  getPoster: async (id: string): Promise<{ data: Poster }> => {
    const res = await MainApi.get<{ data: Poster }>(`/api/v1/posters/${id}`);
    return res.data;
  },

  // Create a new poster
  createPoster: async (posterData: { image: string }): Promise<any> => {
    const formData = new FormData();
    if (posterData.image) {
      const uriParts = posterData.image.split(".");
      const fileType = uriParts[uriParts.length - 1];
      formData.append("image", {
        uri: posterData.image,
        name: `poster-image.${fileType}`,
        type: `image/${fileType}`,
      } as any);
    }
    const res = await MainApi.post(`/api/v1/posters`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  // Update a poster
  updatePoster: async (
    id: string,
    posterData: { image: string }
  ): Promise<any> => {
    const formData = new FormData();
    if (posterData.image && !posterData.image.startsWith("http")) {
      const uriParts = posterData.image.split(".");
      const fileType = uriParts[uriParts.length - 1];
      formData.append("image", {
        uri: posterData.image,
        name: `poster-image.${fileType}`,
        type: `image/${fileType}`,
      } as any);
    }
    const res = await MainApi.put(`/api/v1/posters/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  // Delete a poster
  deletePoster: async (id: string): Promise<any> => {
    const res = await MainApi.delete(`/api/v1/posters/${id}`);
    return res.data;
  },
};
