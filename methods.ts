
import { ILRequest, ILResponse, LCback, ILiweConfig, ILError, ILiWE } from '../../liwe/types';
import { collection_add, collection_find_all, collection_find_one, collection_find_one_dict, collection_find_all_dict, collection_del_one_dict, collection_init, mkid, prepare_filters } from '../../liwe/arangodb';
import { DocumentCollection } from 'arangojs/collection';

import {
	Tag, TagKeys
} from './types';

let _liwe: ILiWE = null;

let _coll_tags: DocumentCollection = null;

const COLL_TAGS = "tags";

/*=== d2r_start __file_header === */
import { list_add, list_del, set_attr } from '../../liwe/utils';
import { perm_available } from '../../liwe/auth';

const tag_get = async ( name: string = null, id: string = null ): Promise<Tag> => {
	const [ filters, values ] = prepare_filters( 'tag', { id, name } );
	return await collection_find_one( _liwe.db, `FOR tag IN ${ COLL_TAGS } ${ filters } RETURN tag`, values );
};

const tag_create = async ( req: ILRequest, name: string, modules: string[], visible: boolean ): Promise<Tag> => {
	const domain = req.session.domain_code;

	if ( !modules ) modules = [ 'system' ];
	name = name.toLowerCase();
	const name_domain = `${ name }_${ domain }`;

	let tag: Tag = { id: mkid( 'tag' ), name, modules, domain, name_domain, count: 0, visible };
	tag = await collection_add( _coll_tags, tag );

	return tag;
};
/*=== d2r_end __file_header ===*/

// {{{ post_tag_admin_add ( req: ILRequest, name: string, visible: boolean = true, cback: LCBack = null ): Promise<Tag>
/**
 * Add or modify a tag
 *
 * @param name - The tag name [req]
 * @param visible - If the tag is visible [opt]
 *
 */
export const post_tag_admin_add = ( req: ILRequest, name: string, visible: boolean = true, cback: LCback = null ): Promise<Tag> => {
	return new Promise( async ( resolve, reject ) => {
		/*=== d2r_start post_tag_admin_add ===*/
		let tag: Tag = await tag_create( req, name, [ 'system' ], visible );

		return cback ? cback( null, tag ) : resolve( tag );
		/*=== d2r_end post_tag_admin_add ===*/
	} );
};
// }}}

// {{{ post_tag_admin_list ( req: ILRequest, cback: LCBack = null ): Promise<Tag[]>
/**
 * List all tags
 *

 *
 */
export const post_tag_admin_list = ( req: ILRequest, cback: LCback = null ): Promise<Tag[]> => {
	return new Promise( async ( resolve, reject ) => {
		/*=== d2r_start post_tag_admin_list ===*/
		const tags: Tag[] = await collection_find_all_dict( req.db, COLL_TAGS, {}, TagKeys );

		return cback ? cback( null, tags ) : resolve( tags );
		/*=== d2r_end post_tag_admin_list ===*/
	} );
};
// }}}

// {{{ patch_tag_admin_update ( req: ILRequest, id: string, name?: string, visible?: boolean, cback: LCBack = null ): Promise<Tag>
/**
 * Updates a tag
 *
 * @param id - Address ID [req]
 * @param name - Tag name [opt]
 * @param visible - If the tag is visible or not. [opt]
 *
 */
export const patch_tag_admin_update = ( req: ILRequest, id: string, name?: string, visible?: boolean, cback: LCback = null ): Promise<Tag> => {
	return new Promise( async ( resolve, reject ) => {
		/*=== d2r_start patch_tag_admin_update ===*/
		let t: Tag = await collection_find_one_dict( req.db, COLL_TAGS, { id } );
		const err = { message: 'Tag not found' };

		if ( !t ) return cback ? cback( err ) : reject( err );

		// If nothing changed, why update the db?
		// if ( visible == t.visible ) return cback ? cback( null, t ) : resolve( t );

		set_attr( t, 'visible', visible );
		t = await collection_add( _coll_tags, t, null, TagKeys );

		return cback ? cback( null, t ) : resolve( t );
		/*=== d2r_end patch_tag_admin_update ===*/
	} );
};
// }}}

// {{{ patch_tag_admin_fields ( req: ILRequest, id: string, data: any, cback: LCBack = null ): Promise<Tag>
/**
 * Modifies some fields
 *
 * @param id - The address ID [req]
 * @param data - The field / value to patch [req]
 *
 */
export const patch_tag_admin_fields = ( req: ILRequest, id: string, data: any, cback: LCback = null ): Promise<Tag> => {
	return new Promise( async ( resolve, reject ) => {
		/*=== d2r_start patch_tag_admin_fields ===*/
		let t: Tag = await collection_find_one_dict( req.db, COLL_TAGS, { id } );
		const err = { message: 'Tag not found' };

		if ( !t ) return cback ? cback( err ) : reject( err );

		// you cannot change tag name
		delete data.name;

		t = { ...t, ...data };
		t = await collection_add( _coll_tags, t, null, TagKeys );

		return cback ? cback( null, t ) : resolve( t );
		/*=== d2r_end patch_tag_admin_fields ===*/
	} );
};
// }}}

// {{{ post_tag_admin_module_add ( req: ILRequest, id: string, module: string, cback: LCBack = null ): Promise<Tag>
/**
 * Adds a new module to a tag
 *
 * @param id - Tag id for update [req]
 * @param module - The module to add [req]
 *
 */
export const post_tag_admin_module_add = ( req: ILRequest, id: string, module: string, cback: LCback = null ): Promise<Tag> => {
	return new Promise( async ( resolve, reject ) => {
		/*=== d2r_start post_tag_admin_module_add ===*/
		const err = { message: 'Tag not found' };
		let tag: Tag = await tag_get( null, id );

		if ( !tag ) return cback ? cback( err ) : reject( err );

		tag.modules = list_add( tag.modules, module );

		tag = await collection_add( _coll_tags, tag, false, TagKeys );

		return cback ? cback( null, tag ) : resolve( tag );
		/*=== d2r_end post_tag_admin_module_add ===*/
	} );
};
// }}}

// {{{ delete_tag_admin_module_del ( req: ILRequest, id: string, module: string, cback: LCBack = null ): Promise<Tag>
/**
 * Deletes a module from a tag
 *
 * @param id - Tag id for update [req]
 * @param module - The module to add [req]
 *
 */
export const delete_tag_admin_module_del = ( req: ILRequest, id: string, module: string, cback: LCback = null ): Promise<Tag> => {
	return new Promise( async ( resolve, reject ) => {
		/*=== d2r_start delete_tag_admin_module_del ===*/
		const err = { message: 'Tag not found' };
		let tag: Tag = await tag_get( null, id );
		if ( !tag ) return cback ? cback( err ) : reject( err );

		tag.modules = list_del( tag.modules, module );

		tag = await collection_add( _coll_tags, tag, false, TagKeys );

		return cback ? cback( null, tag ) : resolve( tag );
		/*=== d2r_end delete_tag_admin_module_del ===*/
	} );
};
// }}}

// {{{ get_tag_list ( req: ILRequest, module?: string, cback: LCBack = null ): Promise<Tag[]>
/**
 * List all available tag
 *
 * @param module - The name of the module to filter for [opt]
 *
 */
export const get_tag_list = ( req: ILRequest, module?: string, cback: LCback = null ): Promise<Tag[]> => {
	return new Promise( async ( resolve, reject ) => {
		/*=== d2r_start get_tag_list ===*/
		const domain = req.session.domain_code;
		const [ filters, values ] = prepare_filters( 'tag', { domain, visible: true } ); // modules: { mode: 'm', val: module, name: 'modules' } } );
		const tags = await collection_find_all( req.db, `FOR tag IN ${ COLL_TAGS } SORT tag.name ${ filters } RETURN tag`, values, TagKeys );

		return cback ? cback( null, tags ) : resolve( tags );
		/*=== d2r_end get_tag_list ===*/
	} );
};
// }}}


/**
 * Initializes tag module database
 *
 * @param liwe - LiWE full config [req]
 *
 */
export const tag_db_init = ( liwe: ILiWE, cback: LCback = null ): Promise<number> => {
	return new Promise( async ( resolve, reject ) => {
		_liwe = liwe;

		_coll_tags = await collection_init( liwe.db, COLL_TAGS, [
			{ type: "persistent", fields: [ "id" ], unique: true },
			{ type: "persistent", fields: [ "domain" ], unique: false },
			{ type: "persistent", fields: [ "name" ], unique: false },
			{ type: "persistent", fields: [ "name_domain" ], unique: true },
			{ type: "persistent", fields: [ "count" ], unique: false },
			{ type: "persistent", fields: [ "visible" ], unique: false },
			{ type: "persistent", fields: [ "modules[*]" ], unique: false },
		], false );

		/*=== d2r_start tag_db_init ===*/

		/*=== d2r_end tag_db_init ===*/
	} );
};

/**
 * Tags an object
 *
 * @param req - The current request [req]
 * @param tags - A list of tags [req]
 * @param obj - The object to tag [req]
 * @param module - The module of id_obj [req]
 *
 */
export const tag_obj = ( req: ILRequest, tags: string[], obj: object, module: string, cback: LCback = null ): Promise<any> => {
	return new Promise( async ( resolve, reject ) => {
		/*=== d2r_start tag_obj ===*/
		const o: any = obj;
		const is_tag_admin: boolean = perm_available( req.user, [ "tag.editor" ] );

		if ( !tags.map ) tags = [ tags as any ];

		if ( !module ) module = "";
		module = module.toLowerCase();

		// we are going to add new tags to object
		// if the obj already has some tags, we keep them
		const my_tags: string[] = o.tags ? o.tags : [];
		await Promise.all( tags.map( async ( name ) => {
			name = name.toLowerCase();

			// If the tag is already in the obj tags
			// we can skip all the rest
			if ( my_tags.indexOf( name ) != -1 ) return;

			let tag = await tag_get( name );
			if ( !tag && is_tag_admin )
				tag = await tag_create( req, name, [ "system" ], true );

			if ( !tag ) return null;

			if ( tag.modules.indexOf( module ) == -1 ) {
				tag.count += 1;
				tag.modules.push( module );

				// update the tag count on db
				await collection_add( _coll_tags, tag );
			}

			my_tags.push( name );
		} ) );

		// assign / overwrite the new tags to the object
		o.tags = my_tags;

		return cback ? cback( null, o ) : resolve( o );
		/*=== d2r_end tag_obj ===*/
	} );
};

/**
 * Remove one or more tags from the object
 *
 * @param tags - A list of tags [req]
 * @param obj - The object to tag [req]
 * @param module - The module of id_obj [req]
 *
 */
export const tag_del_obj = ( tags: string[], obj: object, module: string, cback: LCback = null ): Promise<any> => {
	return new Promise( async ( resolve, reject ) => {
		/*=== d2r_start tag_del_obj ===*/
		const o: any = obj;

		// we are going to add new tags to object
		// if the obj already has some tags, we keep them
		const my_tags: string[] = o.tags ? o.tags : [];
		await Promise.all( tags.map( async ( name ) => {
			name = name.toLowerCase();
			const pos = my_tags.indexOf( name );

			// If the tag does not exists on my_tags
			// we simply skip it
			if ( pos == -1 ) return;

			// Remove elem at 'pos' from object tags
			my_tags.splice( pos, 1 );

			const tag = await tag_get( name );
			if ( !tag ) return null;

			tag.count -= 1;
			if ( tag.count < 0 ) tag.count = 0;

			// update the tag count on db
			await collection_add( _coll_tags, tag );

			my_tags.push( name );
		} ) );

		// assign / overwrite the new tags to the object
		o.tags = my_tags;

		return cback ? cback( null, o ) : resolve( o );
		/*=== d2r_end tag_del_obj ===*/
	} );
};
