
import { ILRequest, ILResponse, ILApplication, ILiweConfig, ILError, ILiWE } from '../../liwe/types';
import { send_error, send_ok, typed_dict } from "../../liwe/utils";

import { perms } from '../../liwe/auth';

import {
	post_tag_admin_add, post_tag_admin_list, patch_tag_admin_update, patch_tag_admin_fields, post_tag_admin_module_add, delete_tag_admin_module_del, get_tag_list, tag_db_init, tag_obj, tag_del_obj
} from './methods';

import {
	Tag
} from './types';

/*=== d2r_start __header ===*/

/*=== d2r_end __header ===*/

/* === TAG API === */
export const init = ( liwe: ILiWE ) => {
	const app = liwe.app;

	console.log( "    - Tag " );

	tag_db_init ( liwe );


	app.post ( "/api/tag/admin/add", perms( [ "tag.editor" ] ), ( req: ILRequest, res: ILResponse ) => {
		const { name, visible, ___errors } = typed_dict( req.fields, [
			{ name: "name", type: "string", required: true },
			{ name: "visible", type: "boolean" }
		] );

		if ( ___errors.length ) return send_error ( res, { message: `Missing required fields: ${___errors.join ( ', ' )}` } );

		post_tag_admin_add ( req,name, visible,  ( err: ILError, tag: Tag ) => {
			if ( err ) return send_error( res, err );

			send_ok( res, { tag } );
		} );
	} );

	app.post ( "/api/tag/admin/list", ( req: ILRequest, res: ILResponse ) => {
		
		
		post_tag_admin_list ( req, ( err: ILError, tags: Tag[] ) => {
			if ( err ) return send_error( res, err );

			send_ok( res, { tags } );
		} );
	} );

	app.patch ( "/api/tag/admin/update", perms( [ "tag.editor" ] ), ( req: ILRequest, res: ILResponse ) => {
		const { id, name, visible, ___errors } = typed_dict( req.fields, [
			{ name: "id", type: "string", required: true },
			{ name: "name", type: "string" },
			{ name: "visible", type: "boolean" }
		] );

		if ( ___errors.length ) return send_error ( res, { message: `Missing required fields: ${___errors.join ( ', ' )}` } );

		patch_tag_admin_update ( req,id, name, visible,  ( err: ILError, tag: Tag ) => {
			if ( err ) return send_error( res, err );

			send_ok( res, { tag } );
		} );
	} );

	app.patch ( "/api/tag/admin/fields", perms( [ "tag.editor" ] ), ( req: ILRequest, res: ILResponse ) => {
		const { id, data, ___errors } = typed_dict( req.fields, [
			{ name: "id", type: "string", required: true },
			{ name: "data", type: "any", required: true }
		] );

		if ( ___errors.length ) return send_error ( res, { message: `Missing required fields: ${___errors.join ( ', ' )}` } );

		patch_tag_admin_fields ( req,id, data,  ( err: ILError, tag: Tag ) => {
			if ( err ) return send_error( res, err );

			send_ok( res, { tag } );
		} );
	} );

	app.post ( "/api/tag/admin/module/add", perms( [ "tag.editor" ] ), ( req: ILRequest, res: ILResponse ) => {
		const { id, module, ___errors } = typed_dict( req.fields, [
			{ name: "id", type: "string", required: true },
			{ name: "module", type: "string", required: true }
		] );

		if ( ___errors.length ) return send_error ( res, { message: `Missing required fields: ${___errors.join ( ', ' )}` } );

		post_tag_admin_module_add ( req,id, module,  ( err: ILError, tag: Tag ) => {
			if ( err ) return send_error( res, err );

			send_ok( res, { tag } );
		} );
	} );

	app.delete ( "/api/tag/admin/module/del", perms( [ "tag.editor" ] ), ( req: ILRequest, res: ILResponse ) => {
		const { id, module, ___errors } = typed_dict( req.fields, [
			{ name: "id", type: "string", required: true },
			{ name: "module", type: "string", required: true }
		] );

		if ( ___errors.length ) return send_error ( res, { message: `Missing required fields: ${___errors.join ( ', ' )}` } );

		delete_tag_admin_module_del ( req,id, module,  ( err: ILError, tag: Tag ) => {
			if ( err ) return send_error( res, err );

			send_ok( res, { tag } );
		} );
	} );

	app.get ( "/api/tag/list", ( req: ILRequest, res: ILResponse ) => {
		const { module, ___errors } = typed_dict( req.query as any, [
			{ name: "module", type: "string" }
		] );

		if ( ___errors.length ) return send_error ( res, { message: `Missing required fields: ${___errors.join ( ', ' )}` } );

		get_tag_list ( req,module,  ( err: ILError, tags: Tag[] ) => {
			if ( err ) return send_error( res, err );

			send_ok( res, { tags } );
		} );
	} );

}
