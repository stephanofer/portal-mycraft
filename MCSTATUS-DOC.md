API Documentation
Documentation on how to integrate our API in your service

Advertisement
Overview
The goal of this API documentation is to accurately and precisely describe the functionality of this service in plain terms. This page will go over everything you need to know before implementing our API into your service. If you believe there is anything missing, any typos, or incorrect information on this page, please reach out to me via email at contact@mcstatus.io.

Standards
The majority of this API uses the standardized REST API, which in simple terms means you will be making HTTP requests to our service. We currently only support endpoints using the GET and POST methods. All status endpoints return a response body in JSON format, except if the response status code is not in the 200-299 success range, in which the body will be plain text. No other data formatting standard is available at this time, and there is currently no future plan to support anything other than JSON. All JSON returned from this service will have whitespace and any unnecessary characters removed to reduce network bandwidth and wasted information. You may learn more about the properties you receive from these routes by reading the documented response body from the route on this page.

Cache
To reduce the amount of spam and deliberate denial-of-service attacks of our service, we implement a caching system for all of the data we fetch, including but not limited to status responses and server icons. Each route has its own cache duration, unique to the pathname of the request. Please note that adding query parameters to the request will not force a fresh request, it will still return the cached response. All routes with data retrieved from the cache will contain a header in the response with the key X-Cache-Hit which will contain a boolean value whether or not our service used a value from cache. The response will also contain a X-Cache-Time-Remaining header if the cache was hit, which contains an integer with the amount of seconds remaining until the cache expires for this request. Any request made after this cache expiration time will result in fresh data being retrieved on our end. No exceptions will be made to the cache duration. If you want to bypass the cache, we recommend that you self-host the ping-server available on our GitHub organization.

Rate Limiting
Since our service receives so many visitors every month, we have to implement a rate-limiting system to prevent abuse of the service. Without a rate-limit, anybody is free to request the API as fast as they want, which can overwhelm our servers with requests if your server accidentally goes haywire. Our service limits to 5 requests/second specified by client IP address. If you want to request an exception to the rate-limit, please reach out to us by emailing contact@mcstatus.io.

Supported Versions
All Minecraft servers, including modern and legacy Java Edition servers, and Bedrock Edition servers, are supported. Make sure you are using the correct endpoint when retrieving a server status, as attempting to use the Java Edition status route with a Bedrock Edition host (or vise-versa) will result in a response saying the server is offline unless the server explicitly has cross-play supported. If the server you specify does not use the standard port value (25565 for Java Edition, 19132 for Bedrock Edition), then you will need to specify the port by using the following format: <host>:<port>.

Query
With both Java and Bedrock Edition status routes, the API will attempt to fetch the query information in addition to the regular status information. This allows more detailed information to be retrieved, like plugins, server software, etc. To prevent excessive amounts of delay when fetching servers that do not support query, a special timeout for query has been implemented. If you fetch a server that successfully returns a status, the API will attempt to wait for only one second longer to retrieve the query before timing out. This behavior cannot be modified. Additionally, all information returned from the query will be used in favor of the status information, except for the following fields: motd, version.protocol, plugins, and software.

Error Handling
You may encounter an error from any API endpoint if you attempt to use any malformed input, such as an incorrectly formatted server address or a strange value for a query parameter. Whether or not you expect it, you should always handle in case the server returns an error, always in the form of a non-200 status code response. If you do receive a non-200 status code response, the body will always contain a plain text string describing the error, with the Content-Type header set to text/plain. An example of a standard error is Invalid address value, returned if the server address provided is not in a recognized <host>:<port> or <host> format.

Revisions
Over the lifetime of this service, there has been a few changes that breaks compatibility with existing users who rely on consistent and non-changing data. When this happens, we release a new major version of the API called a revision, which is why you see /v2 in the URL of all API requests. As time goes on, we can no longer support previous revisions and have to shut them down. You may refer to the table below to see any major revisions from the past up until present time. If you use our API, it is generally recommended to come back to this page every so often to confirm the revision you are using is not becoming deprecated.

Revision	Base URL	Release Date	Deprecation Date	Changelog
Revision 1	https://api.mcstatus.io/v1	September 2021	February 2023	Initial API release
Revision 2	https://api.mcstatus.io/v2	July 2022	—	Click to show changelog
Routes
Java Status
Retrieves the status of any Java Edition Minecraft server. <address> should be replaced with the connection address of the server. For example, play.hypixel.net is a valid connection address as well as play.hypixel.net:25565.

GET
https://api.mcstatus.io/v2/status/java/<address>


Query Parameters

Response Body
Bedrock Status
Retrieves the status of any Bedrock Edition Minecraft server. <address> should be replaced with the connection address of the server. For example, pe.mineplex.com is a valid connection address as well as pe.mineplex.com:19132.

GET
https://api.mcstatus.io/v2/status/bedrock/<address>


Query Parameters

Response Body
Java Widget
Returns a widget image containing information about the Java Edition server. This widget can be embedded into any website or any source that allows images via URL. The image is generated on every request, but the status of the server may be cached.

GET
https://api.mcstatus.io/v2/widget/java/<address>


Query Parameters

Response Body
Bedrock Widget
Returns a widget image containing information about the Bedrock Edition server. This widget can be embedded into any website or any source that allows images via URL. The image is generated on every request, but the status of the server may be cached. The icon will always be the default icon since Bedrock Edition does not support custom server icons.

GET
https://api.mcstatus.io/v2/widget/bedrock/<address>


Query Parameters

Response Body
Icon
Returns just the icon/favicon of any Java Edition Minecraft server. If connection to the server fails or if the server is offline then the default icon is returned. The address value is optional, and if not provided then the default icon is returned.

GET
https://api.mcstatus.io/v2/icon/<address>


Query Parameters

Response Body
Send Vote
Allows you to send a Votifier vote to the specified server. All data should be sent as query parameters.

POST
https://api.mcstatus.io/v2/vote


Query Parameters

Response Body
Libraries
We try and provide official support for integrating our service into many languages. The list of official and unofficial libraries are below.

Official
JavaScript
node-mcstatus
Official
Go
go-mcstatus
Community
Python
python-mcstatus
Support
If you require any additional assistance or found a bug you would like to report, please send an email to api@mcstatus.io. We will be more than happy to provide any assistance.
