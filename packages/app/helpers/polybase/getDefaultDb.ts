import { Polybase } from "@polybase/client";

/**
* Initialize and returns a new Polybase database instance with the specified default namespace.
  @param {string} defaultNamespace - The default namespace for the Polybase instance.
  @returns {Polybase} - The created Polybase instance.
*/
export function getDefaultDb(defaultNamespace: string): Polybase {
    return new Polybase({defaultNamespace: `${defaultNamespace}`})
}

export default getDefaultDb