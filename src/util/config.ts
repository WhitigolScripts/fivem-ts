/*
!   DO NOT MODIFY THIS FILE IF YOU DON'T KNOW WHAT YOU ARE DOING
*/

declare function LoadResourceFile(
	resourceName: string,
	fileName: string,
): string;
declare function GetCurrentResourceName(): string;

import { type Config } from "../config";
const config = JSON.parse(
	LoadResourceFile(GetCurrentResourceName(), "config.json"),
) as Config;

export default config;
