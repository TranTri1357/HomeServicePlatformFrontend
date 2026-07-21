
export interface SearchCategoryResult {
  id: number;
  name: string;
  iconUrl: string;
}

export interface SearchServiceResult {
  id: number;
  name: string;
}

export interface SearchTaskerResult {
  id: number;
  fullName: string;
  ratingAvg: number;
  totalReviews: number;
}

export interface GlobalSearchResult {
  categories: SearchCategoryResult[];
  services: SearchServiceResult[];
  taskers: SearchTaskerResult[];
}
