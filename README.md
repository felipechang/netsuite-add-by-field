# Overview
Search and add line items easily on a sales order
  
# Build and Installation

The application has one `npm run build` command which:
 1) Lints and transpiles add_by_field_userevent.ts 
 2) Merges all html/css/js files in the assets folder
 3) Injects the result one the UE and stores the result in the deploy folder
 4) Once the deploy file is complete, deploy it in your NetSuite account as any other UE script

To update configuration settings go to assets/add_by_field_config.js

# Usage
Start typing on the search box, SKU names will show up along with the quantity available for each.

Click the link once to add an item, each additional time the link is clicked it increases quantity.

Includes pagination with Next/Back links.

# License
GNU GPL see LICENSE.

# Author
Felipe Chang <felipechang@hardcake.org>
