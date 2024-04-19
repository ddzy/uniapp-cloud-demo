/**
 * {
		cloudPath: "1713421646447_0.png"
		extname: "png"
		fileID: "https://mp-65e620ad-f99b-46f7-a8c3-43f2c3a83942.cdn.bspapp.com/cloudstorage/7593ac91-febf-42d8-8b8f-e668fa4059f9.png"
		fileType: "image"
		image: {
			width: 200, 
			height: 200, 
			location: "http://tmp/WcfC5AZfASkh2e4b0a9a79b50a6430c373086227d34b.png"
		}
		name: "WcfC5AZfASkh2e4b0a9a79b50a6430c373086227d34b.png"
		path: "http://tmp/WcfC5AZfASkh2e4b0a9a79b50a6430c373086227d34b.png"
		size: 2201
		status: "success"
		url: "https://mp-65e620ad-f99b-46f7-a8c3-43f2c3a83942.cdn.bspapp.com/cloudstorage/7593ac91-febf-42d8-8b8f-e668fa4059f9.png"
		uuid: 1713421646448
	}
 */
export interface IUniCommonFile {
	cloudPath: string;
	extname: string;
	fileID: string;
	fileType: string;
	image: {
		width: number;
		height: number;
		location: string;
	};
	name: string;
	path: string;
	size: number;
	status: string;
	url: string;
	uuid: number;
}
