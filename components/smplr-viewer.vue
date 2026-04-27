<template>
  <div id="smplr-viewer" class="w-full" />
</template>

<script lang="ts" setup>
import type { Space } from '@smplrspace/smplr-loader';

/**
 ** Components to display a space in the SmplrSpace viewer
 * @props spaceId: string
 * @emits mounted, updated, ready: { queryClient: QueryClient, space: Space, client: Smplr } => Emit an event to the parent component to give access to the current viewer settings
 */

const props = defineProps<{
  spaceId: string;
}>()

const emit = defineEmits(['mounted', "updated", "ready"]);

const config = useRuntimeConfig();

let space: Space | null = null;

/**
 *? When the component is mounted, create a new space and start the viewer     
 */
onMounted(() => {
  /**
   *? Get the Smplr client loaded from the Smplr plugin
   */
  const { $client } = useNuxtApp();

  const client = $client();
  const queryClient = new ($client().QueryClient)({
    organizationId: config.public.SMPLR_ORGANIZATION_ID,
    clientToken: config.public.SMPLR_CLIENT_TOKEN
  });

  space = new client.Space({
      spaceId: props.spaceId,
      clientToken: config.public.SMPLR_CLIENT_TOKEN,
      containerId: "smplr-viewer",
    })
  
    /**
     *? When the viewer is started emit an event to the parent component
     */
    space.startViewer({
      preview: false,
      allowModeChange: true,
    }).then(() => {
      emit('mounted', { queryClient, space, client });
      emit('ready', { queryClient, space, client });
    })
})

watch(props, async (props) => {
  const { $client } = useNuxtApp();
  const client = $client();
  
  /**
   *? We remove the old space before creating a new one
   */
  space!.remove();

  const queryClient = new ($client().QueryClient)({
    organizationId: config.public.SMPLR_ORGANIZATION_ID,
    clientToken: config.public.SMPLR_CLIENT_TOKEN
  });

  space = new client.Space({
      spaceId: props.spaceId,
      clientToken: config.public.SMPLR_CLIENT_TOKEN,
      containerId: "smplr-viewer",
    })
  
  /**
   *? When the viewer is started emit an event to the parent component
    */
  space.startViewer({
    preview: false,
    allowModeChange: true,
  }).then(() => {
    emit('updated', { queryClient, space, client });
    emit('ready', { queryClient, space, client });
  })
})
</script>
