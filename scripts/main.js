import { system, world } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui"


function shouldDamage(player) {
    if (world.getDynamicProperty('darkoak:damage:e37de078-91a1-408b-8a55-bac9efbd7632') === true) {
        player.applyDamage(1)
    }
}

system.runInterval(() => {
    for (const player of world.getPlayers()) {
        const loc = player.location
        const size = world.getDynamicProperty('darkoak:size:e37de078-91a1-408b-8a55-bac9efbd7632')
        if (size === undefined) {
            world.setDynamicProperty('darkoak:size:e37de078-91a1-408b-8a55-bac9efbd7632', '1000000')
            world.setDynamicProperty('darkoak:damage:e37de078-91a1-408b-8a55-bac9efbd7632', false)
        }

        if (loc.x >= size) {
            player.applyKnockback(-1, 0, 2, 0.2)
            shouldDamage(player)
        } else if (loc.x <= -size) {
            player.applyKnockback(1, 0, 2, 0.2)
            shouldDamage(player)
        }

        if (loc.z >= size) {
            player.applyKnockback(0, -1, 2, 0.2)
            shouldDamage(player)
        } else if (loc.z <= -size) {
            player.applyKnockback(0, 1, 2, 0.2)
            shouldDamage(player)
        }

        if (player.hasTag('darkoak:showsizeui') && player.hasTag('darkoak:admin')) {
            const form = new ModalFormData()

            form.title('World Border Size')

            form.textField('Size:', 'Put a number!', world.getDynamicProperty('darkoak:size:e37de078-91a1-408b-8a55-bac9efbd7632'))
            form.toggle('Damage?', world.getDynamicProperty('darkoak:damage:e37de078-91a1-408b-8a55-bac9efbd7632'))

            form.show(player).then((data) => {
                if (data.canceled) return
                if (!isNaN(data.formValues[0])) {
                    world.setDynamicProperty('darkoak:size:e37de078-91a1-408b-8a55-bac9efbd7632', data.formValues[0])
                    world.setDynamicProperty('darkoak:damage:e37de078-91a1-408b-8a55-bac9efbd7632', data.formValues[1])
                    player.sendMessage(`§eSet border size to: ${world.getDynamicProperty('darkoak:size:e37de078-91a1-408b-8a55-bac9efbd7632')}, Damage: ${world.getDynamicProperty('darkoak:damage:e37de078-91a1-408b-8a55-bac9efbd7632')}`)
                } else {
                    player.sendMessage(`§eThat is not a number! Current size: ${world.getDynamicProperty('darkoak:size:e37de078-91a1-408b-8a55-bac9efbd7632')}, Damage: ${world.getDynamicProperty('darkoak:damage:e37de078-91a1-408b-8a55-bac9efbd7632')}`)
                }
            })
            player.removeTag('darkoak:showsizeui')
        }
    }
})
