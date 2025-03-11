#!/usr/bin/env python3

import sys
from fontTools.ttLib import TTFont
from fontTools.subset import Subsetter, Options

def subset_font(input_path, output_path, unicodes):
    # Load the font
    font = TTFont(input_path)

    # Create subsetter with options
    options = Options()
    options.layout_features = ['*']  # Keep all layout features
    options.name_IDs = ['*']  # Keep all name records
    options.notdef_outline = True
    options.recommended_glyphs = True
    options.glyph_names = True

    # Don't subset these tables
    for table in ['GSUB', 'GPOS', 'fvar', 'gvar', 'cvar']:
        if table in options.drop_tables:
            options.drop_tables.remove(table)

    # Create subsetter
    subsetter = Subsetter(options=options)

    # Add unicodes to subset
    unicodes = [int(u, 16) for u in unicodes.split(',')]
    subsetter.populate(unicodes=unicodes)

    # Subset the font
    subsetter.subset(font)

    # Save the subsetted font
    font.save(output_path)

if __name__ == '__main__':
    if len(sys.argv) != 4:
        print("Usage: python3 subset.py input_font output_font unicodes")
        sys.exit(1)

    input_path = sys.argv[1]
    output_path = sys.argv[2]
    unicodes = sys.argv[3]

    subset_font(input_path, output_path, unicodes)