import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from "aws-lambda/trigger/api-gateway-proxy";
import { UserUpdate } from "src/models/users/user";
import usersService from "src/services/usersService";
import responseCreator from "src/utils/responseCreator";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.requestContext.authorizer) {
      return responseCreator.missedRequestAuthorizerContext();
    }
    if (!event.body) {
      return responseCreator.missedEventBody();
    }
    const { userId } = event.requestContext.authorizer.lambda;
    const userUpdate = JSON.parse(event.body) as UserUpdate;
    const result = await usersService.updateUser(userUpdate, userId);
    return responseCreator.default(JSON.stringify(result), 200);
  } catch (err) {
    return responseCreator.error(err);
  }
};
