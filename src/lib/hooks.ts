import { useContext, createEffect, createSignal, onCleanup, untrack, on, createMemo, Accessor } from "solid-js";
import { WunderGraphContext } from "./provider";
import { RequestOptions, MutateRequestOptions, SubscriptionRequestOptions, Response } from "@wundergraph/sdk";
import {
	AddMessageInput,
	ChangeUserNameInput,
	DeleteAllMessagesByUserEmailInput,
	HelloResponse,
	MessagesResponse,
	MockQueryResponse,
	UserInfoResponse,
} from "../../components/generated/models";
import { Config } from './provider';

export const useWunderGraph = () => {
	const ctx: Config|undefined = useContext(WunderGraphContext);
	if (ctx === undefined) {
		throw new Error("WunderGraphContext missing, make sure to put WunderGraphProvider at the root of your app");
	}
	return {
		client: ctx.client,
		user: ctx.user,
		initialized: ctx.initialized,
		initializing: ctx.initializing,
		onWindowFocus: ctx.onWindowFocus,
		onWindowBlur: ctx.onWindowBlur,
		refetchMountedQueries: ctx.refetchMountedQueries,
		setRefetchMountedQueries: ctx.setRefetchMountedQueries,
		queryCache: ctx.queryCache,
	};
};

interface InternalOptions {
	requiresAuthentication: boolean;
}

const extractName = (promiseFactory: (options: RequestOptions<any, any>) => Promise<Response<any>>) => {
	const query = promiseFactory.toString()
	const start = query.indexOf('path')+7
	const end = query.indexOf('"', start)
	const queryName = query.slice(query.indexOf('path')+7, query.indexOf('"', start)) 
	return queryName
}

export const Query = <R extends {}, I extends {}>(
	promiseFactory: (options: RequestOptions<I, R>) => Promise<Response<R>>,
	internalOptions: InternalOptions,
	_options?: RequestOptions<I, R>
) => {
	const { user, initialized, onWindowFocus, refetchMountedQueries, queryCache } = useWunderGraph();
	const [shouldFetch, setShouldFetch] = createSignal<boolean>(_options === undefined ||(_options.initialState === undefined &&_options.lazy !== true));
	const refetch = (options?: RequestOptions<I, R>) => {
		if (options !== undefined) _options = {...options, lazy: false};
		else if (_options && _options.lazy === true){
			_options = {..._options, lazy: false};
		}
		setResponse({ status: "loading" });
		setShouldFetch(true);
	};
	createEffect(on(onWindowFocus,(onWindowFocus) => {
		if (onWindowFocus && _options && _options.refetchOnWindowFocus === true){
			if (_options && _options.lazy === true){
				_options = {..._options, lazy: false};
			}
			setResponse({ status: "loading" });
			setShouldFetch(true);
		} 
	}, { defer: true }));
	const [response, setResponse] = createSignal<Response<R>>(
		_options !== undefined && _options.initialState !== undefined
			? {
				status: "ok",
				body: _options.initialState,
			  }
			  : _options && _options.lazy === true
			  ? { status: "lazy" }  
			: { status: "loading" }
	);
	createEffect(() => {
		if (!initialized()) return;
		
		if (internalOptions.requiresAuthentication && !user()) {
			setShouldFetch(false);			
			setResponse({ status: "requiresAuthentication" });
			return;
		}
		if (!shouldFetch()) return;
		if (_options && _options.lazy === true) return;
		const abortController = new AbortController();
    	const cacheKey = extractName(promiseFactory)+'-'+JSON.stringify(_options);
		const cached = queryCache[cacheKey];
		if (untrack(response).status !== "ok" && cached) {
			setResponse({
				status: "cached",
				body: cached as R,
			});
		}
		(async () => {
			const result = await promiseFactory({
				..._options,
				abortSignal: abortController.signal,
			});
			if (abortController.signal.aborted) {
				setResponse({ status: "aborted" });
				return;
			}
			if (result.status === "ok") queryCache[cacheKey] = result.body;
			setResponse({...result});
			setShouldFetch(false);			
		})();
		onCleanup (() => abortController.abort());
	});
	createEffect(on([user,refetchMountedQueries],() => {
		if (_options && _options.lazy === true){
			_options = {..._options, lazy: false};
		}
		setShouldFetch(true);
	}, { defer: true }));
	return {
		response,
		refetch,
	};
};

const Mutation = <R extends {}, I extends {}>(
	promiseFactory: (options: RequestOptions<I, R>) => Promise<Response<R>>,
	internalOptions: InternalOptions,
	_options?: MutateRequestOptions<I>
) => {
	const { user, setRefetchMountedQueries } = useWunderGraph();
	const [response, setResponse] = createSignal<Response<R>>({ status: "none" });
	const mutate = async (options?: MutateRequestOptions<I>) => {
			if (internalOptions.requiresAuthentication && !user()) {
				setResponse({ status: "requiresAuthentication" });
				return;
			}
			const combinedOptions: MutateRequestOptions<I> = {
				refetchMountedQueriesOnSuccess:
					options !== undefined && options.refetchMountedQueriesOnSuccess !== undefined
						? options.refetchMountedQueriesOnSuccess
						: _options?.refetchMountedQueriesOnSuccess,
				input: options !== undefined && options.input !== undefined ? options.input : _options?.input,
				abortSignal:
					options !== undefined && options.abortSignal !== undefined ? options.abortSignal : _options?.abortSignal,
			};
			setResponse({ status: "loading" });
			const result = await promiseFactory(combinedOptions);
			setResponse({...result});
			if (result.status === "ok" && combinedOptions.refetchMountedQueriesOnSuccess === true) {
				setRefetchMountedQueries(new Date());
			}
	}
	return {
		response,
		mutate,
	};
};

const Subscription = <R extends {}, I extends {}>(
	subscriptionFactory: (options: RequestOptions<I>, cb: (response: Response<R>) => void) => void,
	internalOptions: InternalOptions,
	options?: SubscriptionRequestOptions<I>
) => {
	const { user, initialized, refetchMountedQueries } = useWunderGraph();
	const [response, setResponse] = createSignal<Response<R>>({ status: "loading" });
	const [lastInit, setLastInit] = createSignal<boolean | undefined>();
	
	const computedInit = createMemo<boolean>(() => {
		if (lastInit() === undefined) {
			setLastInit(initialized());
			return initialized();
		}
		if (options?.stopOnWindowBlur) {
			return initialized();
		}
		if (initialized()) {
			setLastInit(true);
			return true;
		}
		return lastInit() as boolean;
	});

	createEffect(on([user, computedInit, refetchMountedQueries], ([user, computedInit, refetchMountedQueries]) => {
		if (!computedInit) {
			return;
		}
		if (internalOptions.requiresAuthentication && !user) {
			setResponse({ status: "requiresAuthentication" });
			return;
		}
		const controller = new AbortController();
		subscriptionFactory(
			{
				...options,
				abortSignal: controller.signal,
			},
			(res) => {
				if (!controller.signal.aborted) setResponse({...res});
			}
		);
		onCleanup (() => controller.abort())
	}));
	return {
		response,
	};
};

export const useLoadingComplete = (...responses: Accessor<Response<any>>[]) => {
	const [loading, setLoading] = createSignal(true);
	createEffect(() => {
		const isLoading = responses.some((r) => r().status === "loading");
		if (isLoading !== loading()) setLoading(isLoading);
	});
	return loading;
};

export const useQuery = {
	Hello: (options?: RequestOptions<never, HelloResponse>) => {
		const { client } = useWunderGraph();
		return Query(client.query.Hello, { requiresAuthentication: false }, options);
	},
	Messages: (options?: RequestOptions<never, MessagesResponse>) => {
		const { client } = useWunderGraph();
		return Query(client.query.Messages, { requiresAuthentication: false }, options);
	},
	MockQuery: (options?: RequestOptions<never, MockQueryResponse>) => {
		const { client } = useWunderGraph();
		return Query(client.query.MockQuery, { requiresAuthentication: false }, options);
	},
	UserInfo: (options?: RequestOptions<never, UserInfoResponse>) => {
		const { client } = useWunderGraph();
		return Query(client.query.UserInfo, { requiresAuthentication: true }, options);
	},
};

export const useMutation = {
	AddMessage: (options: MutateRequestOptions<AddMessageInput>) => {
		const { client } = useWunderGraph();
		return Mutation(client.mutation.AddMessage, { requiresAuthentication: true }, options);
	},
	ChangeUserName: (options: MutateRequestOptions<ChangeUserNameInput>) => {
		const { client } = useWunderGraph();
		return Mutation(client.mutation.ChangeUserName, { requiresAuthentication: true }, options);
	},
	DeleteAllMessagesByUserEmail: (options: MutateRequestOptions<DeleteAllMessagesByUserEmailInput>) => {
		const { client } = useWunderGraph();
		return Mutation(client.mutation.DeleteAllMessagesByUserEmail, { requiresAuthentication: true }, options);
	},
};
export const useLiveQuery = {
	Hello: (options?: SubscriptionRequestOptions) => {
		const { client } = useWunderGraph();
		return Subscription(client.liveQuery.Hello, { requiresAuthentication: false }, options);
	},	
	Messages: (options?: SubscriptionRequestOptions) => {
		const { client } = useWunderGraph();
		return Subscription(client.liveQuery.Messages, { requiresAuthentication: false }, options);
	},
	MockQuery: (options?: SubscriptionRequestOptions) => {
		const { client } = useWunderGraph();
		return Subscription(client.liveQuery.MockQuery, { requiresAuthentication: false }, options);
	},
	UserInfo: (options?: SubscriptionRequestOptions) => {
		const { client } = useWunderGraph();
		return Subscription(client.liveQuery.UserInfo, { requiresAuthentication: true }, options);
	},
};
