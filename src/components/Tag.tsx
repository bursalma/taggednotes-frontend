import styled from "styled-components";
import { Button } from 'antd';

import { useAppSelector, useAppDispatch } from '../redux/store';
import { selectTagById, tagToggled, selectTagMetaBySection } from '../redux/tagSlice';

const Tag: React.FC<{ tagId: number }> = ({ tagId }) => {
    const dispatch = useAppDispatch()
    const tag = useAppSelector(state => selectTagById(state, tagId));
    const { activeTagIds } = useAppSelector(state => selectTagMetaBySection(state, tag?.section!))

    return (
        <TagContainer 
            shape="round" 
            size="small" 
            type="primary" 
            ghost={activeTagIds.includes(tagId)}
            onClick={() => dispatch(tagToggled({ sectionId: tag?.section, tagId: tagId }))}
        >
            {tag?.label}
        </TagContainer>
    )
}

const TagContainer = styled(Button)`
  margin: 3px;
`

export default Tag;