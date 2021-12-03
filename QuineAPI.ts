import { IAuth0UserInfo } from "./Auth0Auth";
import dayjs from "dayjs";
import { config } from "./config";

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
  id: number
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

const fetch = require('node-fetch');
export class QuineAPI {
  constructor(private bearerToken: string, private auth0UserInfo: IAuth0UserInfo) {}

  public async getQuineUserId(): Promise<string> {
    const response = await fetch(config.quineURLs.cosmos.user.register, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify({
        access_code: "",
        email: this.auth0UserInfo.email,
        name: this.auth0UserInfo.name,
        request_id: "",
        token: this.bearerToken,
        updated_at: dayjs(new Date()).format(),
        usernames: [
          {
            provider: this.auth0UserInfo.sub.split("|")[0],
            provider_id: this.auth0UserInfo.sub.split("|")[1],
            handle: this.auth0UserInfo.nickname,
          },
        ],
      }),
    });
    const r = await response.json();
    return r.id;
  }
  public async getRepoRecommendationGroups(userId: number) {
    const res = await fetch(config.quineURLs.scout.recommendation, {
      method: 'PUT',
      headehrs: this.getHeaders(true),
      body: JSON.stringify({

      }),
    });
  }

  public async getRepoRecommendations(userId: number, recommendationGroups: { group: string }[]): Promise<IRepoRecommendationGroup[]> {
    const res = await fetch(config.quineURLs.scout.recommendation, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify({
        "user_id": userId,
        "refresh": true,
        "recommendation_groups": recommendationGroups,
      })
    });
    const k = await res.json();
    return k.recommendations;
  }

  public async getReposInfo(userId: number, repoIds: number[]): Promise<IRepoInfo[]> {
    const res = await fetch(config.quineURLs.scout.repositories.cardInfo, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify({
        "user_id": userId,
        "ids": repoIds,
      })
    });
    const k = await res.json();
    return k.repo_cards;
  }

  private getHeaders(needsAuth: boolean) {
    const headers: {
      'Content-Type': string;
      Authorization?: string;
      Accept: string;
    } = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    if (needsAuth) {
      headers.Authorization = `Bearer ${this.bearerToken}`
    }
    return headers;
  }
}