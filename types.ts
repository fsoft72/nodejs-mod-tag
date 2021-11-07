/*=== d2r_start __header === */

/*=== d2r_end __header ===*/

/** Tag */
export interface Tag {
	/** The tag unique ID */
	id?: string;
	/** The domain name */
	domain?: string;
	/** The tag name */
	name?: string;
	/** The unique key tag <-> domain */
	name_domain?: string;
	/** Number of times this tag has been used */
	count?: number;
	/** If the tag is visible to the public */
	visible?: boolean;
	/** The module using this tag. This is optional, default is 'system' (everywhere) */
	modules?: string[];
}

export const TagKeys = {
	'id': { type: 'string', priv: false },
	'domain': { type: 'string', priv: true },
	'name': { type: 'string', priv: false },
	'name_domain': { type: 'string', priv: true },
	'count': { type: 'number', priv: true },
	'visible': { type: 'boolean', priv: false },
	'modules': { type: 'string[]', priv: false },
};

