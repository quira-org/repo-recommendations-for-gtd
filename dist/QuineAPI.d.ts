import { IAuth0UserInfo } from "./Auth0Auth";
export interface IQuineRegisterUserResponse {
    id: string;
    just_registered: boolean;
    message: string;
    registered_successfully: boolean;
    request_id: string;
}
export interface IRepoRecommendationGroup {
    repo_id: number;
    issue_ids: string[];
    recommendation_group: string;
}
export interface IRepoStatistics {
    prs_trend: number;
    engaged_devs: number;
    num_issues_for_you: number;
}
export interface IRepoLanguage {
    name: string;
    percentage: number;
}
export interface IRepoInfo {
    actions: string[];
    created_at: Date;
    description: string;
    id: number;
    languages: IRepoLanguage[];
    last_commit_at: Date;
    name_with_owner: string;
    stargazer_count: number;
    statistics: IRepoStatistics;
    engaged_devs: number;
    num_issues_for_you: number;
    prs_trend: number;
    topics: string[];
}
export declare class QuineAPI {
    private bearerToken;
    private auth0UserInfo;
    constructor(bearerToken: string, auth0UserInfo: IAuth0UserInfo);
    getQuineUserId(): Promise<string>;
    getRepoRecommendationGroups(userId: number): Promise<void>;
    getRepoRecommendations(userId: number, recommendationGroups: {
        group: string;
    }[]): Promise<IRepoRecommendationGroup[]>;
    getReposInfo(userId: number, repoIds: number[]): Promise<IRepoInfo[]>;
    private getHeaders;
}
