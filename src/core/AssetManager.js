/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { LoadingManager, sRGBEncoding, TextureLoader } from 'three';

class AssetManager {

	constructor() {

		this.textures = new Map();

		this.loadingManager = new LoadingManager();
		this.textureLoader = new TextureLoader( this.loadingManager );

	}

	async init() {

		this._loadTextures();

		return new Promise( ( resolve ) => {

			this.loadingManager.onLoad = () => {

				resolve();

			};

		} );

	}

	_loadTextures() {

		const pitchTexture = this.textureLoader.load( './textures/pitch_texture.jpg' );
		pitchTexture.encoding = sRGBEncoding;
		this.textures.set( 'pitchTexture', pitchTexture );

	}

}

export default AssetManager;
