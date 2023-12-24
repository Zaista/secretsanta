import fs from 'fs';
import {ROLES} from './roles.js';

export const renderer = (filePath, options, callback) => {
    fs.readFile(filePath, (err, content) => {
        if (err) return callback(err);
        let rendered = content.toString();

        if (options.activeGroup === undefined || options.activeGroup.role !== ROLES.admin) {
            rendered = rendered.replace(/<!--adminStart-->(.|\n|\r)*<!--adminEnd-->/m, '');
        }

        if (filePath.includes('menu.html')) {
            options.groups.sort(
                (o1, o2) => (o1.name > o2.name) ? 1 : (o1.name < o2.name) ? -1 : 0
            );
            let groupOptions = '';
            options.groups.forEach(group => {
                groupOptions += `<li class="groupOp" value="${group._id}"><a class="dropdown-item" href="#">${group.name}</a></li>`;
            });
            rendered = rendered.replace('<!--groupOptions-->', groupOptions);

            if (options.activeGroup === undefined) {
                rendered = rendered.replace('<!--groupName-->', 'N/A');
            } else {
                rendered = rendered.replace('<!--groupName-->', options.activeGroup.name);
            }
        }

        if (filePath.includes('santaProfile.html')) {
            rendered = rendered.replaceAll('{{isHidden}}', (process.env.adminElevatedPrivileges || options.isCurrentUser) ? '' : 'hidden');
            rendered = rendered.replace('{{isDisabled}}', (process.env.adminElevatedPrivileges || options.isCurrentUser) ? '' : 'disabled');
            rendered = rendered.replace('{{isPointer}}', (process.env.adminElevatedPrivileges || options.isCurrentUser) ? 'pointer' : '');
        }
        return callback(null, rendered);
    });
}