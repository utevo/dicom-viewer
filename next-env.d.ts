/// <reference types="next" />
/// <reference types="next/types/global" />

declare module "dicom-parser" {
  export interface DataSet {
    byteArray: ByteArray;
    byteArrayParser: ByteArrayParser;
    /**
     * Access element with the DICOM tag in the format xGGGGEEEE.
     */
    elements: {
      [tag: string]: Element;
    };
    warnings: string[];

    /**
     * Finds the element for tag and returns an unsigned int 16 if it exists and has data. Use this function for VR type US.
     */
    uint16: (tag: string, index?: number) => number | undefined;

    /**
     * Finds the element for tag and returns a signed int 16 if it exists and has data. Use this function for VR type SS.
     */
    int16: (tag: string, index?: number) => number | undefined;

    /**
     * Finds the element for tag and returns an unsigned int 32 if it exists and has data. Use this function for VR type UL.
     */
    uint32: (tag: string, index?: number) => number | undefined;

    /**
     * Finds the element for tag and returns a signed int 32 if it exists and has data. Use this function for VR type SL.
     */
    int32: (tag: string, index?: number) => number | undefined;

    /**
     * Finds the element for tag and returns a 32 bit floating point number if it exists and has data. Use this function for VR type FL.
     */
    float: (tag: string, index?: number) => number | undefined;

    /**
     * Finds the element for tag and returns a 64 bit floating point number if it exists and has data. Use this function for VR type FD.
     */
    double: (tag: string, index?: number) => number | undefined;

    /**
     * Returns the actual Value Multiplicity of an element - the number of values in a multi-valued element.
     */
    numStringValues: (tag: string) => number | undefined;

    /**
     * Finds the element for tag and returns a string if it exists and has data. Use this function for VR types AE, CS, SH, and LO.
     */
    string: (tag: string, index?: number) => string | undefined;

    /**
     * Finds the element for tag and returns a string with the leading spaces preserved and trailing spaces removed if it exists and has data. Use this function for VR types UT, ST, and LT.
     */
    text: (tag: string, index?: number) => string | undefined;

    /**
     * Finds the element for tag and parses a string to a float if it exists and has data. Use this function for VR type DS.
     */
    floatString: (tag: string, index?: number) => number | undefined;

    /**
     * Finds the element for tag and parses a string to an integer if it exists and has data. Use this function for VR type IS.
     */
    intString: (tag: string, index?: number) => number | undefined;

    /**
     * Finds the element for tag and parses an element tag according to the 'AT' VR definition if it exists and has data. Use this function for VR type AT.
     */
    attributeTag: (tag: string) => string | undefined;
  }
}
