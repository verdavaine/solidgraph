// Code generated by wunderctl. DO NOT EDIT.

export interface AddMessageInput {
	message: string;
}

export interface ChangeUserNameInput {
	newName: string;
}

export interface DeleteAllMessagesByUserEmailInput {
	email: string;
}

export interface SetLastLoginInput {
	email: string;
}

export interface InternalAddMessageInput {
	email: string;
	name: string;
	message: string;
}

export interface InternalChangeUserNameInput {
	newName: string;
	email: string;
}

export interface InternalDeleteAllMessagesByUserEmailInput {
	email: string;
}

export interface InternalSetLastLoginInput {
	email: string;
}

export interface InternalUserInfoInput {
	email: string;
}

export interface InjectedAddMessageInput {
	email: string;
	name: string;
	message: string;
}

export interface InjectedChangeUserNameInput {
	newName: string;
	email: string;
	updatedAt: string;
}

export interface InjectedDeleteAllMessagesByUserEmailInput {
	email: string;
}

export interface InjectedSetLastLoginInput {
	email: string;
	now: string;
}

export interface InjectedUserInfoInput {
	email: string;
}

export interface AddMessageResponse {
	data?: AddMessageResponseData;
	errors?: ReadonlyArray<GraphQLError>;
}

export interface ChangeUserNameResponse {
	data?: ChangeUserNameResponseData;
	errors?: ReadonlyArray<GraphQLError>;
}

export interface DeleteAllMessagesByUserEmailResponse {
	data?: DeleteAllMessagesByUserEmailResponseData;
	errors?: ReadonlyArray<GraphQLError>;
}

export interface HelloResponse {
	data?: HelloResponseData;
	errors?: ReadonlyArray<GraphQLError>;
}

export interface MessagesResponse {
	data?: MessagesResponseData;
	errors?: ReadonlyArray<GraphQLError>;
}

export interface MockQueryResponse {
	data?: MockQueryResponseData;
	errors?: ReadonlyArray<GraphQLError>;
}

export interface SetLastLoginResponse {
	data?: SetLastLoginResponseData;
	errors?: ReadonlyArray<GraphQLError>;
}

export interface UserInfoResponse {
	data?: UserInfoResponseData;
	errors?: ReadonlyArray<GraphQLError>;
}

export interface AddMessageResponseData {
	createOnemessages?: {
		id: number;
		message: string;
	};
}

export interface ChangeUserNameResponseData {
	updateOneusers?: {
		id: number;
		email: string;
		name: string;
		updatedat: string;
	};
}

export interface DeleteAllMessagesByUserEmailResponseData {
	deleteManymessages?: {
		count: number;
	};
}

export interface HelloResponseData {
	gql_hello?: string;
}

export interface MessagesResponseData {
	findManymessages: {
		id: number;
		message: string;
		users: {
			id: number;
			name: string;
			email: string;
		};
	}[];
}

export interface MockQueryResponseData {
	findFirstusers?: {
		id: number;
		email: string;
		name: string;
	};
}

export interface SetLastLoginResponseData {
	updateOneusers?: {
		id: number;
		lastlogin: string;
	};
}

export interface UserInfoResponseData {
	findFirstusers?: {
		id: number;
		email: string;
		name: string;
		lastlogin: string;
	};
}

export type JSONValue = string | number | boolean | JSONObject | Array<JSONValue>;

export type JSONObject = { [key: string]: JSONValue };

export interface GraphQLError {
	message: string;
	path?: ReadonlyArray<string | number>;
}
