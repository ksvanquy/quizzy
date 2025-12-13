import { Watchlist } from '../watchlist.entity';
import { WatchlistResponseDto } from './watchlist.dto';

/**
 * Watchlist Mapper - Convert between Watchlist entity and WatchlistResponseDto
 */
export class WatchlistMapper {
  /**
   * Convert Watchlist entity to WatchlistResponseDto
   */
  static toResponseDto(watchlist: Watchlist): WatchlistResponseDto {
    return {
      id: watchlist.id,
      userId: watchlist.userId,
      quizId: watchlist.quizId,
      createdAt: watchlist.createdAt,
    };
  }

  /**
   * Convert array of Watchlist entities to ResponseDtos
   */
  static toResponseDtos(watchlists: Watchlist[]): WatchlistResponseDto[] {
    return watchlists.map((watchlist) => this.toResponseDto(watchlist));
  }
}
