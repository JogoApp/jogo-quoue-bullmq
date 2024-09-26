import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { InjectGraphQLClient } from '@golevelup/nestjs-graphql-request';
import { gql, GraphQLClient } from 'graphql-request';

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    authenticateUserWithPassword(email: $email, password: $password) {
      __typename
      ... on UserAuthenticationWithPasswordSuccess {
        sessionToken
      }
      ... on UserAuthenticationWithPasswordFailure {
        message
      }
    }
  }
`;

@Injectable()
export class JwtAuthStrategy {
  constructor(
    private configService: ConfigService,
    @InjectGraphQLClient() private readonly client: GraphQLClient,
  ) {}

  async login(email: string, password: string) {
    const res: any = await this.client.request<{
      authenticateUserWithPassword:
        | { sessionToken: string }
        | { message: string };
    }>(LOGIN_MUTATION, {
      email,
      password,
    });

    if (res?.authenticateUserWithPassword?.sessionToken) {
      return res?.authenticateUserWithPassword.sessionToken;
    }

    return null;
  }

  async validate(token: string) {
    if (token === this.configService.get('NOTIFICATION_SERVICE_TOKEN')) {
      return true;
    }

    try {
      const { data, status } = await axios.post(
        `${this.configService.get('SERVER_URL')}/verify-mf-session?token=${token}`,
      );

      if (data?.session && status === 200) {
        return data?.session;
      }

      throw new Error('Invalid token from backend');
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}
