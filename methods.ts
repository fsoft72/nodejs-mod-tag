
import { ILRequest, ILResponse, LCback, ILiweConfig, ILError, ILiWE } from '../../liwe/types';
import { mkid } from '../../liwe/utils';
import { DocumentCollection } from 'arangojs/collection';
import { $l } from '../../liwe/locale';

import {
	Tag, TagKeys,
} from './types';

let _liwe: ILiWE = null;

const _ = ( txt: string, vals: any = null, plural = false ) => {
	return $l( txt, vals, plural, "tag" );
};

let _coll_tags: DocumentCollection = null;

const COLL_TAGS = "tags";

/*=== f2c_start __file_header === */
import { list_add, list_del, set_attr } from '../../liwe/utils';
import { perm_available } from '../../liwe/auth';
import { system_domain_get_by_session } from '../system/methods';
import { adb_record_add, adb_find_all, adb_find_one, adb_query_all, adb_query_one, adb_prepare_filters, adb_collection_init } from '../../liwe/db/arango';

const tag_get = async ( name: string = null, id: string = null ): Promise<Tag> => {
	const [ filters, values ] = adb_prepare_filters( 'tag', { id, name } );
	return await adb_query_one( _liwe.db, `FOR tag IN ${ COLL_TAGS } ${ filters } RETURN tag`, values );
};

const tag_create = async ( req: ILRequest, name: string, modules: string[], visible: boolean ): Promise<Tag> => {
	const sd = await system_domain_get_by_session( req );
	const domain = sd.code;

	if ( !modules ) modules = [ 'system' ];
	name = name.toLowerCase();
	const name_domain = `${ name }_${ domain }`;

	let tag: Tag = { id: mkid( 'tag' ), name, modules, domain, name_domain, count: 0, visible };
	tag = await adb_record_add( req.db, COLL_TAGS, tag );

	return tag;
};
/*=== f2c_end __file_header ===*/

// {{{ post_tag_admin_add ( req: ILRequest, name: string, visible: boolean = true, cback: LCBack = null ): Promise<Tag>
/**
 *
 * The call creates or updates a tag in the system
 * It is possible to pass the same tag with different `module` fields, and the `module` will be added to the existing modules.
 * This function returns the full `Tag` structure
 *
 * @param name - The tag name [req]
 * @param visible - If the tag is visible [opt]
 *
 * @return tag: Tag
 *
 */
export const post_tag_admin_add = ( req: ILRequest, name: string, visible: boolean = true, cback: LCback = null ): Promise<Tag> => {
	return new Promise( async ( resolve, reject ) => {
		/*=== f2c_start post_tag_admin_add ===*/
		let tag: Tag = await tag_create( req, name, [ 'system' ], visible );

		return cback ? cback( null, tag ) : resolve( tag );
		/*=== f2c_end post_tag_admin_add ===*/
	} );
};
// }}}

// {{{ post_tag_admin_list ( req: ILRequest, cback: LCBack = null ): Promise<Tag[]>
/**
 *
 * List all tags in the system.
 * This function returns the full `Tag` structure
 *
 *
 * @return tags: Tag
 *
 */
export const post_tag_admin_list = ( req: ILRequest, cback: LCback = null ): Promise<Tag[]> => {
	return new Promise( async ( resolve, reject ) => {
		/*=== f2c_start post_tag_admin_list ===*/
		const tags: Tag[] = await adb_find_all( req.db, COLL_TAGS, {}, TagKeys );

		return cback ? cback( null, tags ) : resolve( tags );
		/*=== f2c_end post_tag_admin_list ===*/
	} );
};
// }}}

// {{{ patch_tag_admin_update ( req: ILRequest, id: string, name?: string, visible?: boolean, cback: LCBack = null ): Promise<Tag>
/**
 *
 * Updates a tag.
 * This function returns the full `Tag` structure
 * **NOTE**: at the moment it is not possible to change a tag name.
 *
 * @param id - Address ID [req]
 * @param name - Tag name [opt]
 * @param visible - If the tag is visible or not [opt]
 *
 * @return tag: Tag
 *
 */
export const patch_tag_admin_update = ( req: ILRequest, id: string, name?: string, visible?: boolean, cback: LCback = null ): Promise<Tag> => {
	return new Promise( async ( resolve, reject ) => {
		/*=== f2c_start patch_tag_admin_update ===*/
		let t: Tag = await adb_find_one( req.db, COLL_TAGS, { id } );
		const err = { message: 'Tag not found' };

		if ( !t ) return cback ? cback( err ) : reject( err );

		// If nothing changed, why update the db?
		// if ( visible == t.visible ) return cback ? cback( null, t ) : resolve( t );

		set_attr( t, 'visible', visible );
		t = await adb_record_add( req.db, COLL_TAGS, t, TagKeys );

		return cback ? cback( null, t ) : resolve( t );
		/*=== f2c_end patch_tag_admin_update ===*/
	} );
};
// }}}

// {{{ patch_tag_admin_fields ( req: ILRequest, id: string, data: any, cback: LCBack = null ): Promise<Tag>
/**
 *
 * The call modifies one or more fields.
 * This function returns the full `Tag` structure
 *
 * @param id - The address ID [req]
 * @param data - The field / value to patch [req]
 *
 * @return tag: Tag
 *
 */
export const patch_tag_admin_fields = ( req: ILRequest, id: string, data: any, cback: LCback = null ): Promise<Tag> => {
	return new Promise( async ( resolve, reject ) => {
		/*=== f2c_start patch_tag_admin_fields ===*/
		let t: Tag = await adb_find_one( req.db, COLL_TAGS, { id } );
		const err = { message: 'Tag not found' };

		if ( !t ) return cback ? cback( err ) : reject( err );

		// you cannot change tag name
		delete data.name;

		t = { ...t, ...data };
		t = await adb_record_add( req.db, COLL_TAGS, t, TagKeys );

		return cback ? cback( null, t ) : resolve( t );
		/*=== f2c_end patch_tag_admin_fields ===*/
	} );
};
// }}}

// {{{ post_tag_admin_module_add ( req: ILRequest, id: string, module: string, cback: LCBack = null ): Promise<Tag>
/**
 *
 * Adds a new module to a tag in the system.
 *
 * @param id - Tag id for update [req]
 * @param module - The module to add [req]
 *
 * @return tag: Tag
 *
 */
export const post_tag_admin_module_add = ( req: ILRequest, id: string, module: string, cback: LCback = null ): Promise<Tag> => {
	return new Promise( async ( resolve, reject ) => {
		/*=== f2c_start post_tag_admin_module_add ===*/
		const err = { message: 'Tag not found' };
		let tag: Tag = await tag_get( null, id );

		if ( !tag ) return cback ? cback( err ) : reject( err );

		tag.modules = list_add( tag.modules, module );

		tag = await adb_record_add( req.db, COLL_TAGS, tag, TagKeys );

		return cback ? cback( null, tag ) : resolve( tag );
		/*=== f2c_end post_tag_admin_module_add ===*/
	} );
};
// }}}

// {{{ delete_tag_admin_module_del ( req: ILRequest, id: string, module: string, cback: LCBack = null ): Promise<Tag>
/**
 *
 * Deletes a module from a tag.
 *
 * @param id - Tag id for update [req]
 * @param module - The module to add [req]
 *
 * @return tag: Tag
 *
 */
export const delete_tag_admin_module_del = ( req: ILRequest, id: string, module: string, cback: LCback = null ): Promise<Tag> => {
	return new Promise( async ( resolve, reject ) => {
		/*=== f2c_start delete_tag_admin_module_del ===*/
		const err = { message: 'Tag not found' };
		let tag: Tag = await tag_get( null, id );
		if ( !tag ) return cback ? cback( err ) : reject( err );

		tag.modules = list_del( tag.modules, module );

		tag = await adb_record_add( req.db, COLL_TAGS, tag, TagKeys );

		return cback ? cback( null, tag ) : resolve( tag );
		/*=== f2c_end delete_tag_admin_module_del ===*/
	} );
};
// }}}

// {{{ get_tag_list ( req: ILRequest, module?: string, cback: LCBack = null ): Promise<Tag[]>
/**
 *
 * The call returns a list of all available tag.
 * If `module` is specified, only tag belonging to that module will be returned.
 * This function returns a list of full `Tag` structures
 *
 * @param module - The name of the module to filter for [opt]
 *
 * @return tags: Tag
 *
 */
export const get_tag_list = ( req: ILRequest, module?: string, cback: LCback = null ): Promise<Tag[]> => {
	return new Promise( async ( resolve, reject ) => {
		/*=== f2c_start get_tag_list ===*/
		const domain = req?.session?.domain_code || 'default';
		const [ filters, values ] = adb_prepare_filters( 'tag', { domain, visible: true } ); // modules: { mode: 'm', val: module, name: 'modules' } } );
		const tags = await adb_query_all( req.db, `FOR tag IN ${ COLL_TAGS } SORT tag.name ${ filters } RETURN tag`, values, TagKeys );

		return cback ? cback( null, tags ) : resolve( tags );
		/*=== f2c_end get_tag_list ===*/
	} );
};
// }}}

// {{{ tag_del_obj ( tags: string[], obj: string, module: string, cback: LCBack = null ): Promise<any>
/**
 *
 * This function tags an object in the system.
 * The given `tags` must already exist.
 * If one or more tag in `tags` do not exist, they will simply be skipped with no warning.
 *
 * @param tags - A list of tags [req]
 * @param obj - The object to tag [req]
 * @param module - The module of id_obj [req]
 *
 * @return : any
 *
 */
export const tag_del_obj = ( tags: string[], obj: string, module: string, cback: LCback = null ): Promise<any> => {
	return new Promise( async ( resolve, reject ) => {
		/*=== f2c_start tag_del_obj ===*/
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
			await adb_record_add( _liwe.db, COLL_TAGS, tag );

			my_tags.push( name );
		} ) );

		// assign / overwrite the new tags to the object
		o.tags = my_tags;

		return cback ? cback( null, o ) : resolve( o );
		/*=== f2c_end tag_del_obj ===*/
	} );
};
// }}}

// {{{ tag_obj ( req: ILRequest, tags: string[], obj: string, module: string, cback: LCBack = null ): Promise<any>
/**
 *
 * This function tags an object in the system.
 * The given `tags` must already exist.
 * If one or more tag in `tags` do not exist, they will simply be skipped with no warning.
 *
 * @param req - The current request [req]
 * @param tags - A list of tags [req]
 * @param obj - The object to tag [req]
 * @param module - The module of id_obj [req]
 *
 * @return : any
 *
 */
export const tag_obj = ( req: ILRequest, tags: string[], obj: string, module: string, cback: LCback = null ): Promise<any> => {
	return new Promise( async ( resolve, reject ) => {
		/*=== f2c_start tag_obj ===*/
		const o: any = obj;
		const err = { message: 'Invalid object or null object' };
		const is_tag_admin: boolean = perm_available( req.user, [ "tag.editor" ] );

		if ( !tags ) return cback ? cback( null ) : resolve( true );
		if ( !obj ) return cback ? cback( err ) : reject( err );

		if ( !tags?.map ) tags = [ tags as any ];

		if ( !module ) module = "";
		module = module.toLowerCase();

		// Filter tag names so there are no dupes in input
		const _tags: Record<string, number> = {};
		tags.map( ( tag: string ) => _tags[ tag.toLowerCase() ] = 1 );
		const _tags2 = Object.keys( _tags );

		// we are going to add new tags to object
		// if the obj already has some tags, we keep them
		const my_tags: string[] = o?.tags ? o.tags : [];
		await Promise.all( _tags2.map( async ( name ) => {
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
				await adb_record_add( req.db, COLL_TAGS, tag );
			}

			my_tags.push( name );
		} ) );

		// assign / overwrite the new tags to the object
		o.tags = my_tags;

		return cback ? cback( null, o ) : resolve( o );
		/*=== f2c_end tag_obj ===*/
	} );
};
// }}}

// {{{ tag_db_init ( liwe: ILiWE, cback: LCBack = null ): Promise<boolean>
/**
 *
 * Initializes the module's database
 *
 * @param liwe - The Liwe object [req]
 *
 * @return : boolean
 *
 */
export const tag_db_init = ( liwe: ILiWE, cback: LCback = null ): Promise<boolean> => {
	return new Promise( async ( resolve, reject ) => {
		_liwe = liwe;

		_coll_tags = await adb_collection_init( liwe.db, COLL_TAGS, [
			{ type: "persistent", fields: [ "id" ], unique: true },
			{ type: "persistent", fields: [ "domain" ], unique: false },
			{ type: "persistent", fields: [ "name" ], unique: false },
			{ type: "persistent", fields: [ "name_domain" ], unique: true },
			{ type: "persistent", fields: [ "count" ], unique: false },
			{ type: "persistent", fields: [ "visible" ], unique: false },
			{ type: "persistent", fields: [ "modules[*]" ], unique: false },
		], { drop: false } );

		/*=== f2c_start tag_db_init ===*/

		/*=== f2c_end tag_db_init ===*/
	} );
};
// }}}


